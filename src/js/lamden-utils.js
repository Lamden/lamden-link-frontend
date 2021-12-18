import { get } from "svelte/store";
import { lamdenNetwork, selectedToken, swapInfo, getNetworkStore, selectedNetwork, tabHidden  } from '../stores/globalStores'
import { lamden_vk, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'
import { toBaseUnit, BN } from './global-utils'
import { saveSwap } from './localstorage-utils'

let masternode_MAP = {
    testnet: "testnet-master-1.lamden.io",
    mainnet: "masternode-01.lamden.io"
}

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
            const { latest_block } = synced_stats
            return latest_block
        })
        .catch(err => {
            console.log(err)
            return err
        });
}

export async function getLamdenTxResults(txHash){
    let networkType = get(selectedNetwork)
    let masternode = masternode_MAP[networkType]

    return fetch(`https://${masternode}/tx?hash=${txHash}`).then(res => res.json())

}

export function checkLamdenDepositTransaction(txHash, resultsTracker, callback){
    const onSuccessfulResult = (txResults) => {
        let swapInfoStore = get(swapInfo)

        const { token } = swapInfoStore

        if (txResults.recheck) callback(txResults)
        try{
            const { payload } = txResults.transaction
            const { contract, function: method, kwargs } = payload
            const { amount, ethereum_address } = kwargs

            let tokenAmount = getValueFromFixed(amount)

            if (contract !== token.lamden_clearinghouse){
                resultsTracker.set({errors: [`Error: Invalid Lamden Link contract name in deposit hash.`]})
                return
            }

            if (method !== "deposit"){
                resultsTracker.set({errors: [`Error: This is not a deposit transaction.`]})
                return
            }

            if (ethereum_address !== swapInfoStore.metamask_address){
                resultsTracker.set({errors: [`Error: This deposit hash is for a different metamask address than the one selected.`]})
                return
            }

            if (!swapInfoStore.tokenAmount.isEqualTo(tokenAmount)){
                resultsTracker.set({errors: [`Error: Amount in deposit hash does not match swap details.`]})
                return
            }

            callback(txResults)

        }catch(e){
            console.log(e)
            resultsTracker.set({errors: ["Error: Invalid deposit transcation Hash."]})
        }

    }

    resultsTracker.set({loading: true, status: "Checking status of deposit transaction..."})

    getLamdenTransaction(txHash).then(txResults => {
        if (txResults.error){
            resultsTracker.set({errors: [txResults.error]})
            callback({recheckFailed: true})
        }
    
        let lamdenTxResultsHandler = TransactionResultHandler()
        lamdenTxResultsHandler.parseTxResult(txResults, resultsTracker, onSuccessfulResult)
    })
}

export function checkLamdenBurnTransaction(txHash, resultsTracker, callback){
    const onSuccessfulResult = (txResults) => {
        let swapInfoStore = get(swapInfo)

        const { token } = swapInfoStore

        if (txResults.recheck) callback(txResults)
        try{
            const { payload } = txResults.transaction
            const { contract, function: method, kwargs } = payload
            const { amount, ethereum_address } = kwargs

            let tokenAmount = getValueFromFixed(amount)

            if (contract !== token.lamden_clearinghouse){
                resultsTracker.set({errors: [`Error: Invalid Lamden Link contract hame in burn hash.`]})
                return
            }

            if (method !== "burn"){
                resultsTracker.set({errors: [`Error: This is not a burn transaction.`]})
                return
            }

            if (ethereum_address !== swapInfoStore.metamask_address){
                resultsTracker.set({errors: [`Error: This burn hash is for a different metamask address than the one selected.`]})
                return
            }

            if (!swapInfoStore.tokenAmount.isEqualTo(tokenAmount)){
                resultsTracker.set({errors: [`Error: Amount in burn hash does not match swap details.`]})
                return
            }

            callback(txResults)

        }catch(e){
            console.log(e)
            resultsTracker.set({errors: ["Error: Invalid burn transcation Hash."]})
        }

    }

    resultsTracker.set({loading: true, status: "Checking status of burn transaction..."})

    getLamdenTransaction(txHash).then(txResults => {
        if (txResults.error){
            resultsTracker.set({errors: [txResults.error]})
            callback({recheckFailed: true})
        }
    
        let lamdenTxResultsHandler = TransactionResultHandler()
        lamdenTxResultsHandler.parseTxResult(txResults, resultsTracker, onSuccessfulResult)
    })
}

export function getLamdenTransaction(txHash, resultsTracker, callback){
    return new Promise(resolver => {
        let timesChecked = 0
        let timesToCheck = 2

        function recheck(){
            if (timesToCheck <= timesChecked){
                resolver({error: "Error: Cannot find burn transaction result on Lamden."})
            }else {
                setTimeout(check, 5000)
            }
        }

        async function check(){
            timesChecked = timesChecked + 1

            try{
                var txResults = await getLamdenTxResults(txHash)
            }catch(e){
                console.log(e)
                var txResults = {error: e.message}
            }

            if (txResults.error){
                if (txResults.error === "Transaction not found.") {
                    recheck()
                }else{
                    resolver(txResults)
                }
            }else{
                resolver(txResults)

            }
        }
        setTimeout(check, 5000)
    })   
    
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
        if (get(tabHidden)) {
            console.log("tab not active")
            return
        }

        let blockNum = get(swapInfo).lastLamdenBlockNum - 1

        if (lastCheckedBlockNum === blockNum) return

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
        const { history } = events
        
        if (!history || !Array.isArray(history) || history.length === 0) return

        try{
            for (let event of history){
                const { txInfo, blockNum } = event

                let isMatch = checkForMatchingEvent(txInfo)

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
            if (!kwargs) return false
            const { amount, to } = kwargs


            if (!to || !amount) return false

            return  contract === clearingHouse && 
                    method === "withdraw" &&
                    to.toLowerCase() === swapInfoStore.lamden_address.toLowerCase() &&
                    new BN(amount.__fixed__).isEqualTo(new BN(swapInfoStore.tokenAmount))


        }else{
            const { amount, ethereum_contract, lamden_wallet } = kwargs

            let tokenAmount = toBaseUnit(swapInfoStore.tokenAmount.toString(), swapInfoStore.token.decimals).toString()

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
        timer = setInterval(check, 5000)
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

export async function checkLamdenTokenApproval() {
    let networkType = get(selectedNetwork)
    let token = get(selectedToken)
    let token_contract = token.address
    let clearinghouse = token.lamden_clearinghouse
    let vk = get(lamden_vk)


    try {
        const res = await fetch(`/.netlify/functions/getLamdenTokenAllowance?network=${networkType}&contract=${token_contract}&vk=${vk}&to=${clearinghouse}`)
            .catch((e) => console.log({e}))
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
    let networkType = get(selectedNetwork)
    let swapInfoStore = get(swapInfo)
    let txHash = swapInfoStore.burnHash || swapInfoStore.depositHash

    let timesChecked = 0
    let timesToCheck = 10

    return new Promise(resolver => {
        const checkAgain = () => {
            timesChecked = timesChecked + 1
            if (timesChecked >= timesToCheck){
                resolver()
            }else{
                setTimeout(checkForUnsignedABI, 5000)
            }
        }

        const checkForUnsignedABI = async () => {
            fetch(`/.netlify/functions/getLamdenTxHash?network=${networkType}&hash=${txHash}`)
            .then((res) => {
                if (res.status === 404 || res.status === 500) {
                    throw new Error("check again")
                } 
                return res.json()
            })
            .then((json) => {
                if (!json) throw new Error("check again")
                if (json.error) throw new Error("check again")

                const { txInfo } = json

                if (!txInfo || txInfo === null || txInfo === 'None'){
                    throw new Error("check again")
                }
                resolver(txInfo.result)
            })
            .catch(checkAgain)
        }

        checkForUnsignedABI()

    })
}

const getProof = (unSignedABI, resultsTracker) =>
    new Promise((resolve) => {
        let timesToCheck = 30
        let timesChecked = 0

        let networkType = get(selectedNetwork)
        let token = get(selectedToken)
        
        const checkAgain = () => {
            timesChecked = timesChecked + 1
            if (timesChecked <= timesToCheck) setTimeout(checkForProof, 5000)
            else {
                resultsTracker.set({loading: false, message: `Timed out attempting to get Proof from the Lamden Blockchain. Checked ${timesToCheck} times.`})
                resolve(null)
            }
        }

        const checkForProof = () => {
            fetch(`/.netlify/functions/getLamdenProof?network=${networkType}&clearinghouse=${token.lamden_clearinghouse}&unSignedABI=${unSignedABI.replace(/'/g, '')}`)
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

        let bridge = undefined

        try{
            let bridge = '0x' + unSignedABI.slice(281, 321)
            if (bridge == '0x') bridge = undefined
        }catch(e){}
        

        if (!token || !r || !v || !s || !unSignedABI || !nonce) return false

        return {
            unSignedABI,
            token,
            amount: amountHex,
            nonce: nonce,
            v,
            r,
            s,
            bridge
        }
    } catch (e) {
        //console.log(e)
        return false
    }
}

async function getValueFromResponse(res){
    if (res.status === 200) {
        let json = await res.json()
        return getValueFromFixed(json.value)
    } else {
        return new BN(0)
    }
}

function getValueFromFixed(value){
    if (value) {
        if (value.__fixed__) return new BN(value.__fixed__)
        else return new BN(value)
    } else {
        return new BN(0)
    }
}

function hasEnoughTauToSendTx(txName){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let currencyBalance = get(lamdenCurrencyBalance)
    return currencyBalance.isGreaterThan(lamdenNetworkInfo.stamps[txName] / lamdenNetworkInfo.currentStampRatio)
}