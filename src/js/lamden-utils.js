import BN from 'bignumber.js'
import { get } from "svelte/store";
import { lamdenNetwork, selectedToken, swapInfo, getNetworkStore  } from '../stores/globalStores'
import { lamden_vk, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'

export const start_burn = () => {

}

export async function checkLamdenTokenBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token_contract = get(selectedToken).address
    let vk = get(lamden_vk)

    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/${token_contract}/balances/${vk}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        return new BN(0)
    }
}

export async function checkLamdenBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let vk = get(lamden_vk)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/currency/balances/${vk}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        console.log({error})
        return new BN(0)
    }
}

export async function checkLamdenTokenApproval() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token = get(selectedToken)
    let token_contract = token.address
    let clearinghouse = token.lamden_clearinghouse
    let vk = get(lamden_vk)

    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/${token_contract}/balances/${vk}:${clearinghouse}`, {
                method: 'GET',
            },
        ).catch((e) => console.log({e}))
        let value = await getValueFromResponse(res)
        lamdenTokenApprovalAmount.set(value)
    } catch (error) {
        lamdenTokenApprovalAmount.set(new BN(0))
    }
}

export async function sendBurnApproval(resultsTracker, callback){
    if (!hasEnoughTauToSendTx("approval")) {
        let lamdenNetworkInfo = get(lamdenNetwork)

        let message = `Not enough Lamden ${lamdenNetworkInfo.currencySymbol} to send transactions. Send ${lamdenNetworkInfo.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`

        resultsTracker.set({loading: false, message})
    } else {
        resultsTracker.set({loading: true, status: 'Sending Burn Approval. Check for Lamden Wallet Popup.'})
        sendLamdenApproval(resultsTracker, callback)
    }
}

function sendLamdenApproval (resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token = get(selectedToken)

    let swapInfoStore = get(swapInfo)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.clearingHouse.networkType,
        contractName: token.address,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: swapInfoStore.tokenAmount.toString() },
            to: token.lamden_clearinghouse,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}



function handleTxResults(txResults, resultsTracker, callback){
    if (!txResults.data) 
        resultsTracker.set({loading:false, errors: ["Transaction result unavailable."]})
    else {
        txResults = txResults.data
        let lamdenTxResultsHandler = TransactionResultHandler()
        lamdenTxResultsHandler.parseTxResult(txResults, resultsTracker, callback)
    }
}


export function startBurn(resultsTracker, callback) {
    if (!hasEnoughTauToSendTx("burn")) {
        let lamdenNetworkInfo = get(lamdenNetwork)

        let message = `Not enough Lamden ${lamdenNetworkInfo.currencySymbol} to send transactions. Send ${lamdenNetworkInfo.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`

        resultsTracker.set({loading: false, message})
    } else {
        let token = get(selectedToken)
        resultsTracker.set({loading: true, status: `Attempting to Burn ${token.name} tokens on the Lamden Blockchain (check for Lamden Wallet popup)...`})

        sendBurn(resultsTracker, callback)
    }
}

function sendBurn (resultsTracker, callback) {
    let lamdenNetworkInfo = get(lamdenNetwork)

    let swapInfoStore = get(swapInfo)
    let toNetworkInfo = get(getNetworkStore(swapInfoStore.to))

    console.log(toNetworkInfo)

    let lamdenToken = get(selectedToken)
    let metamask_address = swapInfoStore.metamask_address

    let tokenInfo = toNetworkInfo.tokens[swapInfoStore.from].find(t => t.symbol === lamdenToken.symbol)

    if (!tokenInfo){
        resultsTracker.set({loading: false, errors: [`Could not find token ${lamdenToken.symbol} info on the ${swapInfoStore.to} network.`]})
        return
    }
    let ethereum_contract = tokenInfo.address

    let walletController = get(lwc)

    const txInfo = {
        contractName: lamdenToken.lamden_clearinghouse,
        networkType: lamdenNetworkInfo.clearingHouse.networkType,
        methodName: 'burn',
        kwargs: {
            ethereum_contract,
            ethereum_address: metamask_address,
            amount: { __fixed__: swapInfoStore.tokenAmount.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.burn,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export async function continueBurn(resultsTracker, callback){
    let swapInfoStore = get(swapInfo)
    let unSignedABI = swapInfoStore.unSignedABI

    if (!unSignedABI){
        if (swapInfoStore.burnHash){
            resultsTracker.set({loading: true, status: 'Recovering Proof-of-Burn from lamden blockchain.'})
            unSignedABI = await getUnsignedABIFromBlockchain()
            if (!unSignedABI){
                resultsTracker.set({loading: false, errors: ['Could not get Proof-of-Burn from burn hash.']})
                return
            }
        }else{
            resultsTracker.set({loading: false, errors: ['Could not find burn hash in swap details.']})
            return
        }
    }

    const signedABI = await getProof(unSignedABI, resultsTracker)
    
    if (!signedABI) {
        if (signedABI === null) return
        resultsTracker.set({loading: false, errors: ['Invalid Proof-of-Burn stored in burn hash.']})
        return
    }

    const proofData = processProof(unSignedABI, signedABI)

    if (!proofData) {
        resultsTracker.set({loading: false, errors: ['Malformed Proof-of-Burn stored in burn hash.']})
        return
    }

    callback(proofData)
}

function getUnsignedABIFromBlockchain(){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let swapInfoStore = get(swapInfo)
    let burnTxHash = swapInfoStore.burnHash

    return fetch(`${lamdenNetworkInfo.apiLink}/transactions/get/${burnTxHash}`)
        .then((res) => {
            if (res.status === 404) return
            else return res.json()
        })
        .then((json) => {
            if (!json) return
            if (!json.result || json.result === null || json.result === 'None')
                return
            return json.result
        })
    }

const getProof = (unSignedABI, resultsTracker) =>
    new Promise((resolve) => {
        let timesToCheck = 60
        let timesChecked = 0

        let lamdenNetworkInfo = get(lamdenNetwork)
        let token = get(selectedToken)
        
        const checkAgain = () => {
            timesChecked = timesChecked + 1
            if (timesChecked <= timesToCheck) setTimeout(checkForProof, 1000)
            else {
                resultsTracker.set({loading: false, message: `Timed out attempting to get Proof-of-Burn from the Lamden Blockchain. Checked ${timesToCheck} times.`})
                resolve(null)
            }
        }

        const checkForProof = () => {
            fetch(`${lamdenNetworkInfo.apiLink}/states/${token.lamden_clearinghouse}/proofs/${unSignedABI.replace(/'/g, '')}`)
                .then((res) => res.json())
                .then((json) => {
                    //console.log({ json })
                    if (!json) {
                        checkAgain()
                        return
                    }
                    if (!json.value || json.value === null) {
                        checkAgain()
                        return
                    }
                    resolve(json.value)
                })
        }
        checkForProof()
    })

function processProof(unSignedABI, signedABI) {
    try {
        signedABI = signedABI.substr(2) //remove 0x
        const r = '0x' + signedABI.slice(0, 64)
        const s = '0x' + signedABI.slice(64, 128)
        const v = '0x' + signedABI.slice(128, 130)

        const amountHex = '0x' + unSignedABI.substring(65, 129)
        const nonce = '0x' + unSignedABI.substring(129, 193)

        const token = '0x' + unSignedABI.slice(25, 65)

        if (!token || !r || !v || !s || !unSignedABI || !nonce) return false

        return {
            unSignedABI,
            token,
            amount: amountHex,
            nonce: nonce,
            v,
            r,
            s,
        }
    } catch (e) {
        //console.log(e)
        return false
    }
}

async function getValueFromResponse(res){
    if (res.status === 200) {
        let json = await res.json()
        let value = json.value
        if (value) {
            if (value.__fixed__) return new BN(value.__fixed__)
            else return new BN(value)
        } else {
            return new BN(0)
        }
    } else {
        return new BN(0)
    }
}

function hasEnoughTauToSendTx(txName){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let currencyBalance = get(lamdenCurrencyBalance)
    return currencyBalance.isGreaterThan(lamdenNetworkInfo.stamps[txName] / lamdenNetworkInfo.currentStampRatio)
}