import { web3, selectedAccount, chainData } from 'svelte-web3'
import { get } from "svelte/store";
import BN from 'bignumber.js'
import { swapInfo, getNetworkStore, selectedToken } from '../stores/globalStores';
import { ethChainBalance, ethChainTokenBalance } from '../stores/ethereumStores';
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

    if (swapInfoStore.withdrawHash){
        resultTracker.set({loading: true, status: `Accepted By Network. Awaiting transaction result. This could take awhile depending on gas used.`})
        checkEthTransactionUntilResult(swapInfoStore.withdrawHash, callback)
    }else{
        resultTracker.set({loading: true, status: `Sending ${swapInfoStore.token.symbol} tokens from Lamden to Ethereum (check for Metamask popup)...`})
        
        let proofData = swapInfoStore.proofData
    
        if (!proofData){
            resultTracker.set({loading: false, error: 'Unable to get Proof Data from swap info.'})
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
    
    
        try {
            withdraw
                .send({ from: metamask_address })
                .once('transactionHash', (hash) => {
                    swapInfo.update(curr => {
                        curr.withdrawHash = hash
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