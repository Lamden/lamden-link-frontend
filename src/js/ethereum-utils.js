import { web3, selectedAccount, chainData } from 'svelte-web3'
import { get } from "svelte/store";

import { swapInfo, getNetworkStore, selectedToken, selectedNetwork } from '../stores/globalStores';
import { ethChainBalance, ethChainTokenBalance, ethChainTokenAllowance } from '../stores/ethereumStores';
import { saveSwap } from './localstorage-utils' 
import { BN, toBaseUnit, get_bridge_info } from './global-utils' 
import { ERC20_ABI } from './abi/erc20_abi'


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
    
    return await w3.eth.getBalance(account)
        .then((res) => {
            try{
                ethChainBalance.set(new BN(w3.utils.fromWei(res, 'ether')))
            }catch(e){
                console.log(e)
                ethChainBalance.set(new BN(0))
            }
        })
        .catch(err => {
            console.log(err)
            ethChainBalance.set(new BN(0))
        })
}

export async function checkChainTokenBalance() {
    let swapInfoStore = get(swapInfo)

    let token = get(selectedToken)
    let metamask_address = get(selectedAccount)

    let w3 = get(web3)

    try {
        const erc20TokenContract = new w3.eth.Contract(
            ERC20_ABI,
            token.address,
        )
        let val = await erc20TokenContract.methods
            .balanceOf(metamask_address)
            .call()
        if (val) {
            val = new BN(w3.utils.fromWei(val, 'ether'))
        } else {
            val = new BN(0)
        }

        ethChainTokenBalance.set(val)
        return val

    } catch (error) {
        console.log(error)
    }

}

export async function checkTokenAllowance() {
    let swapInfoStore = get(swapInfo)

    const { token } = swapInfoStore

    let metamask_address = get(selectedAccount)
    

    if (!token){
        return
    }

    const bridge = get_bridge_info(token)

    let w3 = get(web3)
    try {
        const erc20TokenContract = new w3.eth.Contract(
            ERC20_ABI,
            token.address,
        )
        
        let val = await erc20TokenContract.methods
            .allowance(metamask_address, bridge.clearingHouse.address)
            .call()

        if (val) {
            val = new BN(w3.utils.fromWei(val, 'ether'))
        } else {
            val = new BN(0)
        }
        ethChainTokenAllowance.set(val)
        return val

    } catch (error) {
        console.log(error)
        return new BN(0)
    }
}

export function checkChain() {
    let networkInfo = getCorrectNetwork()
    if (!networkInfo) return true // return true because we are not in swap
    let chainInfo = get(chainData)
    return chainInfo.chainId === networkInfo.chainId
}

export async function getCurrentEthereumBlockNum(){
    let w3 = get(web3)
    let blockNum = await w3.eth.getBlockNumber()
    return blockNum
}

export function checkForEthereumConfirmations(statusStore, startingBlock){
        let swapInfoStore = get(swapInfo)
        let fromNetwork = swapInfoStore.from.toUpperCase()
    
        return new Promise((resolve) => {
            async function check(){
                getCurrentEthereumBlockNum()
                .then((block) => {
                    if (block) {
                        let confirmations = block - startingBlock
                        statusStore.set({loading: true, status: `${fromNetwork} confirmations ${confirmations}/20. Please be patient...`})
                        if (confirmations > 20){
                            swapInfo.update(curr => {
                                curr.ethConfirmed = true
                                return curr
                            })
                            saveSwap()
                            resolve()
                        }else{
                            setTimeout(check, 30000)
                        }
                    }

                })
                .catch((err)=> {
                    console.log(err)
                    statusStore.set({errors: [`Error getting current block number: ${err.message}`]})
                    setTimeout(check, 30000)
                })
            }
            
            check()
        })
    }

export const checkForEthereumEvents = (statusStore, doneCallback) => {
    let w3 = get(web3)
    let swapInfoStore = get(swapInfo)
    let fromNetwork = swapInfoStore.from.toUpperCase()
    const networkType = get(selectedNetwork).toUpperCase()
    let timer = null

    const bridge = get_bridge_info(swapInfoStore.token)

    const clearingHouseContract = new w3.eth.Contract(
        bridge.clearingHouse.abi,
        bridge.clearingHouse.address
    )

    function check(){

        let fromBlock = get(swapInfo).lastETHBlockNum
        let toBlock = 'latest'

        if (fromBlock){
            fetch(`/.netlify/functions/getChainEvents?networkType=${networkType}&fromNetwork=${fromNetwork}&fromBlock=${fromBlock}&toBlock=${toBlock}&eventType=${bridge.clearingHouse.depositEvent}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bridge.clearingHouse)
            })
            .then(res => res.json())
            .then(handleResponse)
            .catch(err => {
                console.log(err)
                statusStore.set({errors: [`Error checking for Deposit event: ${err.message}`]})
                stopChecking()
            });
        }


    }

    function handleResponse(events){
        if (!events || !Array.isArray(events) || events.length === 0) return
        try{
            for (let event of events){
                const { blockNumber, returnValues, transactionHash } = event
    
                let isMatch = checkForMatchingEvent(returnValues)

                if (isMatch){
                    swapInfo.update(curr => {
                        curr.metamaskDeposit = transactionHash
                        curr.depositEventBlock = blockNumber
                        return curr
                    })
                    saveSwap()
                    stopChecking()

                    doneCallback()
                    break
                }
                
                updateLastCheckedBlock(blockNumber)
            }
        }catch(e){
            console.log(e)
            statusStore.set({errors: [`Error checking for Deposit event: ${e.message}`]})
        }

    }

    function updateLastCheckedBlock(blockNumber){

        swapInfo.update(curr => {
            curr.lastETHBlockNum = blockNumber
            return curr
        })
        
        saveSwap()
    }

    function checkForMatchingEvent(returnValues){
        const { token, receiver, amount } = returnValues;
        let tokenAmount = toBaseUnit(swapInfoStore.tokenAmount.toString(), swapInfoStore.token.decimals).toString()

        if (bridge.depositEvent === "TokensWrapped"){
            if (!token) return false
            if (token.toLowerCase() !== swapInfoStore.token.address.toLowerCase()) return false
        }
        
        if (!receiver || !amount || isNaN(amount)) return false
        if (receiver.toLowerCase() !== swapInfoStore.lamden_address.toLowerCase()) return false
        if (new BN(amount).toString() !== tokenAmount) return false

        return true
    }

    function startChecking(){
        statusStore.set({loading: true, status: `Checking ${fromNetwork} for your successful Deposit transaction...`})
        check()
        if (timer) stopChecking()
        timer = setInterval(check, 10000)
    }

    function stopChecking(){
        statusStore.set({})
        clearInterval(timer)
        timer = null
    }

    return {
        startChecking,
        stopChecking,
        stopped: () => timer === null,
        started: () => timer !== null
    }
}

export function attemptToGetCurrentBlock(statusStore){
    let swapInfoStore = get(swapInfo)
    let fromNetwork = swapInfoStore.from.toUpperCase()

    let timesToCheck = 10
    let checked = 0

    return new Promise((resolve, reject) => {
        async function check(){
            getCurrentEthereumBlockNum()
            .then((block) => {
                if (block) {
                    statusStore.set({})
                    resolve(block)
                }
                else {
                    checked = checked + 1
                    if (checked > timesToCheck){
                        statusStore.set({errors: [`Timed out getting current block number from ${fromNetwork}. Check your internet connection and try again.`]})
                        reject("timed out")
                    }else{
                        setTimeout(check, 2000)
                    }
                }
            })
            .catch((err)=> {
                console.log(err)
                statusStore.set({errors: [`Error getting current block number: ${err.message}`]})
                reject(err)
            })
        }
        statusStore.set({loading: true, status: `Getting current ${fromNetwork} block...`})
        check()
    })
}

export function sendProofToEthereum(resultTracker, callback){
    let w3 = get(web3)
    let swapInfoStore = get(swapInfo)
    let networkInfo = getCorrectNetwork()

    if (swapInfoStore.withdrawHashPending){
        resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.withdrawHashPending, w3, callback)
        return
    }

    resultTracker.set({loading: true, status: `Sending ${swapInfoStore.token.symbol} tokens from Lamden to ${swapInfoStore.to} (check for Metamask popup)...`})
    
    let proofData = swapInfoStore.proofData        

    if (!proofData){
        resultTracker.set({loading: false, errors: ['Unable to get Proof Data from swap info.']})
        return
    }

    let metamask_address = get(selectedAccount)

    if (metamask_address.toLowerCase() !== swapInfoStore.metamask_address.toLowerCase()){
        resultTracker.set({loading: false, message: `Switch Metamask account to ${swapInfoStore.metamask_address}.`})
        return
    }

    const bridge = get_bridge_info(swapInfoStore.mintedToken)

    const clearingHouseContract = new w3.eth.Contract(
        bridge.clearingHouse.abi,
        bridge.clearingHouse.address,
    )


    let withdraw = null

    if (proofData.bridge.length > 2){
        withdraw = clearingHouseContract.methods.withdraw(
            proofData.token,
            proofData.amount,
            proofData.nonce,
            proofData.v,
            proofData.r,
            proofData.s,
            proofData.bridge
        )
    }else{
        withdraw = clearingHouseContract.methods.withdraw(
            proofData.token,
            proofData.amount,
            proofData.nonce,
            proofData.v,
            proofData.r,
            proofData.s
        )

    }

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
                resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
                checkEthTransactionUntilResult(hash, w3, callback)
                swapInfo.update(curr => {
                    curr.withdrawHashPending = hash
                    return curr
                })
                saveSwap()
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

async function checkEthTransactionUntilResult (txHash, w3, callback) {
    let txHashInfo = await checkEthTxStatus(txHash, w3)

    if (!txHashInfo){
        setTimeout(
            () => checkEthTransactionUntilResult(txHash, w3, callback),
            30000,
        )
    }
    else callback(txHashInfo)
}

async function checkEthTxStatus (txHash, w3) {
    try {
        let response = await w3.eth.getTransactionReceipt(txHash)
        return response
    } catch (e) {console.log(e)}
    return false
}

export function sendEthChainApproval(resultTracker, callback){

    const w3 = get(web3)
    const swapInfoStore = get(swapInfo)
    const networkInfo = getCorrectNetwork()
    const token = get(selectedToken)
    const metamask_address = get(selectedAccount)
    const tokenAmount = swapInfoStore.tokenAmount

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

    const bridge = get_bridge_info(swapInfoStore.token) 

    const approve = erc20TokenContract.methods.approve(
        bridge.clearingHouse.address,
        quantity,
    )

    try {
        approve
            .send({ from: metamask_address })
            .once('transactionHash', (hash) => {
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

    try{
        var quantity = toBaseUnit(tokenAmount.toString(), token.decimals).toString()
    }catch(err){
        console.log(err)
        resultTracker.set({loading: false, errors: [err.message]})
        return
    }

    resultTracker.set({loading: true, status: `Sending ${networkInfo.networkName} ${token.symbol} deposit transaction (check for metamask popup)...`}) 

    const bridge = get_bridge_info(swapInfoStore.token)

    const clearingHouseContract = new w3.eth.Contract(
        bridge.clearingHouse.abi,
        bridge.clearingHouse.address,
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