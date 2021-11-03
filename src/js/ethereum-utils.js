import { web3, selectedAccount, chainData } from 'svelte-web3'
import { get } from "svelte/store";
import BN from 'bignumber.js'
import { swapInfo, getNetworkStore, selectedToken, selectedNetwork } from '../stores/globalStores';
import { ethChainBalance, ethChainTokenBalance } from '../stores/ethereumStores';
import { saveSwap } from './localstorage-utils' 
import { isString } from './global-utils' 
import { ERC20_ABI } from './erc20_abi'

function getCorrectNetwork(){
    let swapInfoStore = get(swapInfo)
    if (swapInfoStore.to === "lamden"){
        return get(getNetworkStore(swapInfoStore.from))
    }else{
        return get(getNetworkStore(swapInfoStore.to))
    }
}

export async function checkChainBalance() {
    let account = get(selectedAccount)
    let w3 = get(web3)
    if (!account) return
    
    return await w3.eth.getBalance(account).then((res) => {
        try{
            ethChainBalance.set(new BN(w3.utils.fromWei(res, 'ether')))
        }catch(e){
            console.log(e)
            ethChainBalance.set(new BN(0))
        }
    })
}

export async function checkChainTokenBalance() {
    let token = get(selectedToken)
    let metamask_address = get(selectedAccount)

    let w3 = get(web3)
    try {
        const erc20TokenContract = new w3.eth.Contract(
            ERC20_ABI,
            token.address,
        )
        const val = await erc20TokenContract.methods
            .balanceOf(metamask_address)
            .call()
        if (val) {
            ethChainTokenBalance.set(new BN(w3.utils.fromWei(val, 'ether')))
        } else {
            ethChainTokenBalance.set(new BN(0))
        }

    } catch (error) {
        //console.log(error)
    }

}

export function checkChain() {
    let networkInfo = getCorrectNetwork()
    let chainInfo = get(chainData)
    return chainInfo.chainId === networkInfo.chainId
}

export function sendProofToEthereum(resultTracker, callback){
    let w3 = get(web3)
    let swapInfoStore = get(swapInfo)
    let networkInfo = getCorrectNetwork()

    if (swapInfoStore.withdrawHashPending){
        resultTracker.set({loading: true, status: `Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.withdrawHashPending, w3, callback)
        return
    }

    if (swapInfoStore.withdrawHash){
        resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.withdrawHash, callback)
    }else{
        resultTracker.set({loading: true, status: `Sending ${swapInfoStore.token.symbol} tokens from Lamden to ${swapInfoStore.to} (check for Metamask popup)...`})
        
        let proofData = swapInfoStore.proofData        
    
        if (!proofData){
            resultTracker.set({loading: false, errors: ['Unable to get Proof Data from swap info.']})
            return
        }

        let metamask_address = get(selectedAccount)

        if (metamask_address !== swapInfoStore.metamask_address){
            resultTracker.set({loading: false, message: `Switch Metamask account to ${swapInfoStore.metamask_address}.`})
            return
        }
    
        const clearingHouseContract = new w3.eth.Contract(
            networkInfo.clearingHouse.abi,
            networkInfo.clearingHouse.address,
        )
    
        let withdraw = clearingHouseContract.methods.withdraw(
            proofData.token,
            proofData.amount,
            proofData.nonce,
            proofData.v,
            proofData.r,
            proofData.s,
        )

        if (get(selectedNetwork) !== 'mainnet'){
            console.log({metamask_address})
            console.log({proofData})
            console.log({withdraw})
            console.log({networkInfo})
        }
    
        try {
            withdraw
                .send({ from: metamask_address })
                .once('transactionHash', (hash) => {
                    swapInfo.update(curr => {
                        curr.withdrawHashPending = hash
                        return curr
                    })
                    resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
                    checkEthTransactionUntilResult(hash, w3, callback)
                })
                .catch((err) => {
                    if (err.code === 4001){
                        resultTracker.set({loading: false, message: 'User denied Metamask popup.'})
                    }
                    else resultTracker.set({loading: false, errors: [err.message]})
                })
        } catch (err) {
            resultTracker.set({loading: false, errors: [err.message]})
        }
    }


}

async function checkEthTransactionUntilResult (txHash, w3, callback) {
    let txHashInfo = await checkEthTxStatus(txHash, w3)
    if (!txHashInfo || !txHashInfo.status)
        setTimeout(
            () => checkEthTransactionUntilResult(txHash, w3, callback),
            5000,
        )
    else callback(txHashInfo)
}

async function checkEthTxStatus (txHash, w3) {
    try {
        let response = await w3.eth.getTransactionReceipt(txHash)
        return response
    } catch (e) {}
    return false
}

export function sendEthChainApproval(resultTracker, callback){

    const w3 = get(web3)
    const swapInfoStore = get(swapInfo)
    const networkInfo = getCorrectNetwork()
    const token = get(selectedToken)
    const metamask_address = get(selectedAccount)
    const tokenAmount = swapInfoStore.tokenAmount

    if (swapInfoStore.metamaskApprovalPending){
        resultTracker.set({loading: true, status: `Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.metamaskApprovalPending, w3, callback)
        return
    }

    try{
        var quantity = toBaseUnit(tokenAmount.toString(), token.decimals).toString()
    }catch(e){
        console.log(e)
        resultTracker.set({loading: false, errors: [e.message]})
        return
    }

    resultTracker.set({loading: true, status: `Sending ${networkInfo.networkName} ERC20 token approval transaction (check for metamask popup)...`})    

    const erc20TokenContract = new w3.eth.Contract(
        ERC20_ABI,
        token.address,
    )

    const approve = erc20TokenContract.methods.approve(
        networkInfo.clearingHouse.address,
        quantity,
    )

    try {
        approve
            .send({ from: metamask_address })
            .once('transactionHash', (hash) => {
                swapInfo.update(curr => {
                    curr.metamaskApprovalPending = hash
                    return curr
                })
                saveSwap()
                resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
                checkEthTransactionUntilResult(hash, w3, callback)
            })
            .catch((err) => {
                console.log(err)
                if (err.code === 4001){
                    console.log(err)
                    resultTracker.set({loading: false, message: 'User denied Metamask popup.'})
                } else {
                    console.log(err)
                    resultTracker.set({loading: false, errors: [err.message]})
                }
            })
    } catch (err) {
        console.log(err)
        resultTracker.set({loading: false, errors: [err.message]})
    }
}

export function sendEthChainDeposit(resultTracker, callback){
    const w3 = get(web3)
    const swapInfoStore = get(swapInfo)
    const networkInfo = getCorrectNetwork()
    const token = get(selectedToken)
    const metamask_address = get(selectedAccount)
    const lamden_address = swapInfoStore.lamden_address
    const tokenAmount = swapInfoStore.tokenAmount

    if (swapInfoStore.metamaskDepositPending){
        resultTracker.set({loading: true, status: `Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.metamaskDepositPending, w3, callback)
        return
    }

    try{
        var quantity = toBaseUnit(tokenAmount.toString(), token.decimals).toString()
    }catch(err){
        console.log(err)
        resultTracker.set({loading: false, errors: [err.message]})
        return
    }

    resultTracker.set({loading: true, status: `Sending ${networkInfo.networkName} ${token.symbol} deposit transaction (check for metamask popup)...`}) 

    const clearingHouseContract = new w3.eth.Contract(
        networkInfo.clearingHouse.abi,
        networkInfo.clearingHouse.address,
    )

    const deposit = clearingHouseContract.methods.deposit(
        token.address,
        quantity,
        lamden_address,
    )

    try {
        deposit
            .send({ from: metamask_address })
            .once('transactionHash', (hash) => {
                swapInfo.update(curr => {
                    curr.metamaskDepositPending = hash
                    return curr
                })
                saveSwap()
                checkEthTransactionUntilResult(hash, w3, callback)
            })
            .catch((err) => {
                console.log(err)
                if (err.code === 4001){
                    resultTracker.set({loading: false, message: 'User denied Metamask popup.'})
                } else {
                    console.log(err)
                    resultTracker.set({loading: false, errors: [err.message]})
                }
            })
    } catch (err) {
        console.log(err)
        resultTracker.set({loading: false, errors: [err.message]})
    }
}

function toBaseUnit(value, decimals) {
    const w3 = get(web3)

    if (!isString(value)) {
        throw new Error('Pass strings to prevent floating point precision issues.')
    }
    const ten = new w3.utils.BN(10)
    const base = ten.pow(new w3.utils.BN(decimals))

    // Is it negative?
    let negative = value.substring(0, 1) === '-'
    if (negative) {
        value = value.substring(1)
    }

    if (value === '.') {
        throw new Error(
            `Invalid value ${value} cannot be converted to` +
            ` base unit with ${decimals} decimals.`,
        )
    }

    // Split it into a whole and fractional part
    let comps = value.split('.')
    if (comps.length > 2) {
        throw new Error('Too many decimal points')
    }

    let whole = comps[0],
        fraction = comps[1]

    if (!whole) {
        whole = '0'
    }
    if (!fraction) {
        fraction = '0'
    }
    if (fraction.length > decimals) {
        throw new Error('Too many decimal places')
    }

    while (fraction.length < decimals) {
        fraction += '0'
    }

    whole = new w3.utils.BN(whole)
    fraction = new w3.utils.BN(fraction)
    let wei = whole.mul(base).add(fraction)

    if (negative) {
        wei = wei.neg()
    }

    return new w3.utils.BN(wei.toString(10), 10)
}

export function waitForConfirmations (resultTracker, txHash, confirmationsToWait){
    const w3 = get(web3)

    return new Promise(async (resolve, reject) => {
        let txResult = await getTransactionHashResult(txHash)
        console.log({txResult})

        if (txResult === null) {
            reject("Could not get block number from transaction hash.")
            return
        }

        const { blockNumber } = txResult 

        if (!blockNumber) {
            reject("Could not get block number from transaction hash.")
            return
        }

        let startingBlock = blockNumber

        resultTracker.set({
            loading: true,
            message: `Starting at block ${startingBlock}, waiting ${confirmationsToWait} confirmations...`
        })
        console.log(`Starting at block ${startingBlock}, waiting ${confirmationsToWait} confirmations...`)

        const checkBlock = async () => {
            let nextBlock = await w3.eth.getBlockNumber()

            let confirmations = nextBlock - startingBlock

            if (confirmations > confirmationsToWait) {
                console.log(`Ended at block ${startingBlock} and waited ${confirmations} confirmations.`)
                resolve(confirmations)
            }
            else {
                resultTracker.set({
                    loading: true,
                    message: `Waited ${confirmations} confirmations...`
                })
                setTimeout(checkBlock, 5000)
            }
        }

        setTimeout(checkBlock, 1000)
    })
}

const getTransactionHashResult = (txHash) => {
    const w3 = get(web3)

    return new Promise((resolver) => {
        w3.eth.getTransaction(txHash, function(err, tx){
            if (err) return null
            resolver(tx)
        });
    })
}