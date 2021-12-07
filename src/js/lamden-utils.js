import BN from 'bignumber.js'
import { get } from "svelte/store";
import { lamdenNetwork, selectedToken, swapInfo, getNetworkStore, selectedNetwork, tabHidden  } from '../stores/globalStores'
import { lamden_vk, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'
import { toBaseUnit } from './global-utils'
import { saveSwap } from './localstorage-utils'

export async function checkLamdenTokenBalance() {
    let token_contract = get(selectedToken).address
    let vk = get(lamden_vk)
    let networkType = get(selectedNetwork)

    try {
        const res = await fetch(`/.netlify/functions/getLamdenTokenBalance?network=${networkType}&contract=${token_contract}&vk=${vk}`)
        let val = await getValueFromResponse(res)
        return val
    } catch (error) {
        console.log(error)
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

export async function getCurrentLamdenBlockNum(){
    let networkType = get(selectedNetwork)

    return fetch(`/.netlify/functions/getLamdenCurrentBlock?&network=${networkType}`)
        .then(res => res.json())
        .then(synced_stats => {
            console.log(synced_stats)
            const { latest_block } = synced_stats
            return latest_block
        })
        .catch(err => {
            console.log(err)
            return err
        });
}


export function attemptToGetLamdenCurrentBlock(statusStore){
    let timesToCheck = 10
    let checked = 0

    return new Promise((resolve, reject) => {
        async function check(){
            getCurrentLamdenBlockNum()
            .then((block) => {
                console.log(block)
                if (block && !block.error) {
                    statusStore.set({})
                    resolve(block)
                }
                else {
                    checked = checked + 1
                    if (checked > timesToCheck){
                        statusStore.set({errors: [`Timed out getting current block number from Lamden. Check your internet connection and try again.`]})
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
        statusStore.set({loading: true, status: `Getting current Lamden block...`})
        check()
    })
}

export const checkForLamdenEvents = (statusStore, doneCallback) => {
    let timer = null
    let lastCheckedBlockNum = null

    let swapInfoStore = get(swapInfo)

    const { mintedToken, token } = swapInfoStore

    let contract = mintedToken.address
    let networkType = get(selectedNetwork)

    let clearingHouse = mintedToken.lamden_clearinghouse
    
    function check(){
        console.log("checking for lamden events")

        if (get(tabHidden)) {
            console.log("tab not active")
            return
        }

        let blockNum = get(swapInfo).lastLamdenBlockNum - 1

        if (lastCheckedBlockNum === blockNum) return

        console.log("checking for lamden events at blocknumber " + blockNum)

        fetch(`/.netlify/functions/getLamdenContractHistory?contract=${contract}&blockNum=${blockNum}&network=${networkType}`)
		.then(res => res.json())
        .then(handleResponse)
        .catch(err => {
            console.log(err)
            statusStore.set({errors: [`Error checking for Lamden Mint event: ${err.message}`]})
            stopChecking()
        });
    }

    function handleResponse(events){
        console.log(events)

        const { history } = events
        
        if (!history || !Array.isArray(history) || history.length === 0) return

        try{
            for (let event of history){
                const { txInfo, blockNum } = event

                let isMatch = checkForMatchingEvent(txInfo)
                console.log({isMatch})

                if (isMatch){
                    if (txInfo.status === 0){
                        swapInfo.update(curr => {
                            curr.LamdenMintHash = txInfo.hash
                            curr.complete = true
                            return curr
                        })
                        saveSwap()
                        stopChecking()
                        doneCallback()
                        break
                    }else{
                        statusStore.set({errors: [`Error sending tokens: ${txInfo.result}`]})
                    }
                }

                updateLastCheckedBlock(blockNum)
            }
        }catch(e){
            console.log(e)
            statusStore.set({errors: [`Error checking for Lamden Mint event: ${e.message}`]})
        }
    }

    function updateLastCheckedBlock(blockNumber){
        console.log({blockNumber})
        swapInfo.update(curr => {
            curr.lastLamdenBlockNum = blockNumber
            return curr
        })
        lastCheckedBlockNum = blockNumber
        saveSwap()
    }

    function checkForMatchingEvent(txInfo){

        const { transaction } = txInfo
        const { payload } = transaction
        const { kwargs, contract, function: method } = payload

        if (token.origin_lamden){
            const { amount, to } = kwargs

            console.log({
                txInfo, contract, clearingHouse, method, amount, to
            })

            if (!to || !amount) return false

            console.log(contract === clearingHouse)
            console.log(method === "withdraw")
            console.log(to.toLowerCase() === swapInfoStore.lamden_address.toLowerCase())
            console.log(new BN(amount.__fixed__).isEqualTo(new BN(swapInfoStore.tokenAmount)))

            return  contract === clearingHouse && 
                    method === "withdraw" &&
                    to.toLowerCase() === swapInfoStore.lamden_address.toLowerCase() &&
                    new BN(amount.__fixed__).isEqualTo(new BN(swapInfoStore.tokenAmount))


        }else{
            const { amount, ethereum_contract, lamden_wallet } = kwargs

            let tokenAmount = toBaseUnit(swapInfoStore.tokenAmount.toString(), swapInfoStore.token.decimals).toString()

            console.log({
                txInfo, contract, method, ethereum_contract, lamden_wallet, amount: new BN(amount).toString()
            })

            if (!ethereum_contract || !lamden_wallet || !amount) return false

            return  contract === clearingHouse && 
                    method === "mint" &&
                    lamden_wallet.toLowerCase() === swapInfoStore.lamden_address.toLowerCase() &&
                    new BN(amount).toString() === tokenAmount
        }
    }

    function startChecking(){
        statusStore.set({loading: true, status: `Checking Lamden for your ${swapInfoStore.mintedToken.symbol} tokens. This shouldn't take long...`})
        check()
        if (timer) stopChecking()
        timer = setInterval(check, 30000)
    }

    function stopChecking(){
        console.log("STOPPING CHECKING FOR LAMDEN EVENTS")
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
export async function sendDepositApproval(resultsTracker, callback){
    if (!hasEnoughTauToSendTx("approval")) {
        let lamdenNetworkInfo = get(lamdenNetwork)

        let message = `Not enough Lamden ${lamdenNetworkInfo.currencySymbol} to send transactions. Send ${lamdenNetworkInfo.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`

        resultsTracker.set({loading: false, message})
    } else {
        resultsTracker.set({loading: true, status: 'Sending Deposit Approval. Check for Lamden Wallet Popup.'})
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

export function startDeposit(resultsTracker, callback) {
    if (!hasEnoughTauToSendTx("burn")) {
        let lamdenNetworkInfo = get(lamdenNetwork)

        let message = `Not enough Lamden ${lamdenNetworkInfo.currencySymbol} to send transactions. Send ${lamdenNetworkInfo.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`

        resultsTracker.set({loading: false, message})
    } else {
        let token = get(selectedToken)
        resultsTracker.set({loading: true, status: `Attempting to Deposit ${token.name} into the Lamden Link Contract. Please check for Lamden Wallet popup...`})

        sendDeposit(resultsTracker, callback)
    }
}

function sendDeposit (resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token = get(selectedToken)

    let swapInfoStore = get(swapInfo)
    let walletController = get(lwc)
    const { tokenAmount, metamask_address } = swapInfoStore

    const txInfo = {
        networkType: lamdenNetworkInfo.clearingHouse.networkType,
        contractName: token.lamden_clearinghouse,
        methodName: 'deposit',
        kwargs: {
            amount: { __fixed__: tokenAmount.toString() },
            ethereum_address: metamask_address
        },
        stampLimit: lamdenNetworkInfo.stamps.approval
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
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

    let tokenInfo = toNetworkInfo.tokens[swapInfoStore.from].find(t => t.symbol === lamdenToken.symbol || t.lamden_equivalent === lamdenToken.symbol)

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

export async function continueDeposit(resultsTracker, callback){
    let swapInfoStore = get(swapInfo)
    let unSignedABI = swapInfoStore.unSignedABI

    if (!unSignedABI){
        if (swapInfoStore.depositHash){
            resultsTracker.set({loading: true, status: 'Recovering Proof-of-Deposit from Lamden blockchain.'})
            unSignedABI = await getUnsignedABIFromBlockchain()

            if (!unSignedABI){
                resultsTracker.set({loading: false, errors: ['Could not get Proof-of-Deposit the Lamden Blockchain.']})
                return
            }
        }else{
            resultsTracker.set({loading: false, errors: ['Could not find deposit hash in swap details.']})
            return
        }
    }

    const signedABI = await getProof(unSignedABI, resultsTracker)
    
    if (!signedABI) {
        if (signedABI === null) return
        resultsTracker.set({loading: false, errors: ['Invalid Proof-of-Deposit stored in deposit hash.']})
        return
    }

    const proofData = processProof(unSignedABI, signedABI)

    if (!proofData) {
        resultsTracker.set({loading: false, errors: ['Malformed Proof-of-Deposit stored in deposit hash.']})
        return
    }

    callback(proofData)
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
    let txHash = swapInfoStore.burnHash || swapInfoStore.depositHash

    return fetch(`${lamdenNetworkInfo.apiLink}/transactions/get/${txHash}`)
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
                resultsTracker.set({loading: false, message: `Timed out attempting to get Proof from the Lamden Blockchain. Checked ${timesToCheck} times.`})
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