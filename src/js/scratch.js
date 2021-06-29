async function checkTokenBalance(event) {
    if (event.target.value) {
        tokenName = event.target.value;
        const token = conf.ethereum.tokens
            .filter((t) => t.name === tokenName)
            .pop();
        try {
            const res = await fetch(
                `${conf.lamden.network.apiLink}/states/${conf.lamden.token.contractName}/balances/${$vk}`,
                {
                    method: "GET",
                }
            );
             if (res.status === 200) {
                const value = (await res.json()).value;
                if (value) {
                    if (value.__fixed__) balance = new BN(value.__fixed__)
                    else balance = new BN(value)
                } else {
                    balance = new BN(0);
                }
            }
        } catch (error) {
            balance = new BN(0);
        }
    }else{
        tokenName = ""
    }
}
async function checkApproval() {
    status = "Checking for Approval...";
    try {
        const res = await fetch(
            `${conf.lamden.network.apiLink}/states/${conf.lamden.token.contractName}/balances/${$vk}:${conf.lamden.clearingHouse.contractName}`,
            {
                method: "GET",
            }
        ).catch((e) => console.log("ERROR"));
        if (res.status === 200) {
            const value = (await res.json()).value;
            if (value) {
                if (value.__fixed__) return new BN(value.__fixed__)
                else return new BN(value)
            } else {
                return new BN(0);
            }
        }else{
            return new BN(0);
        }
    } catch (error) {
        return new BN(0);
    }
}
const sendApproval = (amountToApprove) => new Promise(resolve => {
    status = "Sending Lamden approval (check popup)...";
    const txInfo = {
        networkType: conf.lamden.clearingHouse.networkType,
        contractName: conf.lamden.token.contractName,
        methodName: "approve",
        kwargs: {
            amount: { "__fixed__": amountToApprove.toFixed(18) },
            to: conf.lamden.clearingHouse.contractName
        },
        stampLimit: conf.lamden.stamps.approval,
    };
     $lwc.sendTransaction(txInfo, async (txResults) => {
         if (txResults.status === "Transaction Cancelled") {
            message = "Transaction canceled by user."
            resolve(false)
        }
        if (txResults.data) {
            if (txResults.data.txHash) lamdenApprovalTxHash.hash =  txResults.data.txHash
        }
        if (txResults.status === "success") {
            try {
                status = "Lamden approval sent...";
                lamdenApprovalTxHash.success = true
                resolve(true)
            } catch (error) {
                message = 'Transaction failed';
                lamdenApprovalTxHash.success = false
                resolve(false)
            }
        } else {
            message = getErrorInfo(txResults)
            lamdenApprovalTxHash.success = false
            resolve(false)
        }
    });	
})
const sendBurn = (token, amount) => new Promise(resolve => {
    const ethereum_contract = token.address;
    const txInfo = {
        networkType: conf.lamden.clearingHouse.networkType,
        methodName: "burn",
        kwargs: {
            ethereum_contract,
            ethereum_address: $selectedAccount,
            amount: { "__fixed__": amount.toFixed(18) },
        },
        stampLimit: conf.lamden.stamps.burn,
    };

    $lwc.sendTransaction(txInfo, async (txResults) => {
         if (txResults.status === "Transaction Cancelled") {
            message = "Transaction canceled by user."
        }else{
            if (txResults.data) {
                if (txResults.data.txHash) lamdenBurnTxHash.hash = txResults.data.txHash
            }
            if (txResults.status === "success") {
                try {
                    const unSignedABI = txResults.data.txBlockResult.result
                    lamdenBurnTxHash.success = true
                    resolve(unSignedABI)
                    return
                } catch (error) {
                    message = 'Transaction failed';
                    lamdenBurnTxHash.success = false
                    isLoading = false;
                }
            } else {
                lamdenBurnTxHash.success = false
                message = getErrorInfo(txResults)
            }
        }
        status = ""
        isLoading = false;
        resolve(false)
    });
})
const getUnsignedABIFromBlockchain = (txHash) => new Promise(resolve => {
    fetch(`${conf.lamden.network.apiLink}/transactions/get/${txHash}`)
    .then(res => {
        if (res.status === 404) throw new Error()
        else return res.json()
    })
    .then((json) => {
        console.log({json})
        if (!json) resolve(false)
        else{
            if (!json.result || json.result === null || json.result === "None") resolve(false)
            else resolve(json.result)	
        }
    })
    .catch(err => resolve(false))
})

const getProof = (unSignedABI) => new Promise(resolve => {
    let timesToCheck = 60
    let timesChecked = 0

    const checkAgain = () => {
        timesChecked = timesChecked + 1
        if (timesChecked <= timesToCheck) setTimeout(checkForProof, 1000)
        else{
            message =   `Timed out attempting to get Proof of Burn from the Lamden Blockchain. Checked ${timesToCheck} times.`;
            resolve(false)
        }
    }

    const checkForProof = async () => {
        console.log({timesChecked})
        fetch(`${conf.lamden.network.apiLink}/states/${conf.lamden.clearingHouse.contractName}/proofs/${unSignedABI.replace(/'/g, "")}`)
        .then(res => res.json())
        .then((json) => {
            console.log({json})
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

const processProof = (unSignedABI, signedABI) => {
    try{
        signedABI = signedABI.substr(2); //remove 0x
        const r = '0x' + signedABI.slice(0, 64)
        const s = '0x' + signedABI.slice(64, 128)
        const v = '0x' + signedABI.slice(128, 130)

        const amountHex = "0x" + unSignedABI.substring(65, 129);
        const nonce = "0x" + unSignedABI.substring(129, 193);

        const token = conf.ethereum.tokens.find((t) => t.name === 'WETH')

         if (!token || !r || !v || !s || !unSignedABI || !nonce) return false

        return  {
            unSignedABI,
            token: token.address,
            amount: amountHex,
            nonce: nonce,
            v,
            r,
            s,
        }
    }catch(e){
        console.log(e)
        return false
    }
}

const sendProofToEthereum = async (proofData) => {
    const clearingHouseContract = new $web3.eth.Contract(
        conf.ethereum.clearingHouse.abi,
        conf.ethereum.clearingHouse.address
    );

    let withdraw = clearingHouseContract.methods
                    .withdraw(proofData.token, proofData.amount, proofData.nonce, proofData.v, proofData.r, proofData.s)

    return await new Promise(resolver => {
        try{
            withdraw.send({from: $selectedAccount}).once('transactionHash', (hash) => {
                ethTxHash.hash = hash
                checkEthTransactionUntilResult(ethTxHash.hash, $web3, resolver)
            })
            .catch(err => {
                if (err.code === 4001) resolver({status: false, message:"User denied Metamask popup."})
                else resolver({status: false})					
            })
        }catch (err) {
            resolver({status: false})
        }
    })
}

async function startBurn(event) {
    ethTxHash = {hash: "", success: false}
    lamdenApprovalTxHash = {hash: "", success: false}
    lamdenBurnTxHash = {hash: "", success: false}
    isLoading = true
    message = ""
    status = ""
    success = ""
    const formData = new FormData(event.target);
    tokenName = formData.get("tokenName").toString();

    let amount = new BN(formData.get("quantity"));

    const token = conf.ethereum.tokens.find((t) => t.name === tokenName)

    if (!token) {
        isLoading = false;
        message = "Invalid Token Selected.";
        return;
    }

    if (amount.isNaN() || amount.isLessThanOrEqualTo(0)) {
        isLoading = false;
        message = "Invalid quantity";
        return;
    }

    let currentApprovalAmount = await checkApproval()

    if (currentApprovalAmount.isLessThan(amount)){
        if ($tauBalance.isLessThan(conf.lamden.stamps.approval / conf.lamden.currentStampRatio)){
            status = ""
            isLoading = false;
            message =  `Not enough Lamden ${conf.lamden.currencySymbol} to send transactions.
                        Send ${conf.lamden.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`;
            return;
        }else{
            if (!await sendApproval(amount)) {
                isLoading = false;
                return;
            }
        }
    }

    if ($tauBalance.isLessThan(conf.lamden.stamps.burn / conf.lamden.currentStampRatio)){
        isLoading = false;
        status = ""
        message =   `Not enough Lamden ${conf.lamden.currencySymbol} to send transactions.
                    Send ${conf.lamden.currencySymbol} to your Lamden Link account from within the Lamden Wallet.`;
    }else{
        status = `Attempting to Burn ${token.name} tokens on the Lamden Blockchain (check for Lamden Wallet popup)...`
        const unSignedABI = await sendBurn(token, amount)
        console.log({status, isLoading})

        if (!unSignedABI){
            isLoading = false;
            status = ""
            message = `Unable to Burn ${WETH} tokens on the Lamden Blockchain.`;
        }else{
            console.log({status, isLoading})
            continueBurn(unSignedABI)
        }
    }
}

const resumeBurn = async () => {
    ethTxHash = {hash: "", success: false}
    lamdenApprovalTxHash = {hash: "", success: false}
    lamdenBurnTxHash = {hash: "", success: false}

    const formData = new FormData(event.target);
    const txHash = formData.get("txHash").toString();

    isLoading = true;
    message = "";
    status = `Checking Lamden Blockchain for Proof of token Burn...`

    const unSignedABI = await getUnsignedABIFromBlockchain(txHash)
    console.log({unSignedABI})
    console.log({status})
    if (unSignedABI) {
        lamdenBurnTxHash.hash = txHash
        lamdenBurnTxHash.success = true
        continueBurn(unSignedABI)
    }else {
        isLoading = false;
        status=""
        message = "Unable to get Burn Result from transaction hash provided.";
    }
}

const continueBurn = async (unSignedABI) => {
    console.log({status, isLoading})
    const signedABI = await getProof(unSignedABI)
    if (!signedABI){
        isLoading = false;
        status = ""
        return
    }else{
        status = `Got Burn Proof from the Lamden Blockchain.`
        console.log({status, isLoading})
    }

    status = `Processing Burn Proof...`
    console.log({status})

    const proofData = processProof(unSignedABI, signedABI)
    if (!proofData) {
        message = "Malformed Proof"
        isLoading = false;
        status = ""
        return
    }
    status = `Sending ${tokenName} tokens from Lamden to Ethereum (check for Metamask popup)...`
    console.log({status})
    const txHashResult = await sendProofToEthereum(proofData)
    console.log({txHashResult})
    finishBurn(txHashResult)
}

const finishBurn = (txHashResult) => {
    status = ""
    isLoading = false;
    message=""
    if (!txHashResult.status){
        message=txHashResult.message || "Error sending Ethereum Transaction."
        ethTxHash.success = false
        return
    }
    ethTxHash.success = true
    success = `${tokenName} tokens sent to Ethereum Chain`;
}

const toggleResume = () => newSwap = !newSwap

const handleAmountInput = (e) => {
    e.target.setCustomValidity('')
    e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}
const handleAmountInvalid = (e) => e.target.setCustomValidity('A number is required')

const handleTxHashInput = (e) => e.target.setCustomValidity('')
const handleTxHashInvalid = (e) => e.target.setCustomValidity('Invalid Lamden Transaction Hash')