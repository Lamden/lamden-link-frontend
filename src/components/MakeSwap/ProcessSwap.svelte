<script>
    import { setContext, getContext, tick } from 'svelte'
    import { navigate } from "svelte-routing";

    // Components
    import Step from './Step.svelte'
    import LamdenWalletStep from '../ProcessingSteps/LamdenWalletStep.svelte'
    import MetamaskStep from '../ProcessingSteps/MetamaskStep.svelte'
    import LamdenBurnStep from '../ProcessingSteps/LamdenBurn.svelte'
    import EthereumWithdraw from '../ProcessingSteps/EthereumWithdraw.svelte'
    import EthereumTokenApproval from '../ProcessingSteps/EthereumTokenApproval.svelte'
    import EthereumDeposit from '../ProcessingSteps/EthereumDeposit.svelte'
    import SwapVisual from './SwapVisual.svelte'

    // Misc
    import { selectedNetwork, swapInfo } from '../../stores/globalStores'
    import { setSwapInHistory } from '../../js/localstorage-utils'
    import { copyToClipboard } from '../../js/global-utils'
import App from '../../App.svelte';

    const connectLamdenWalletStep = {
        name: "Lamden Wallet",
        desc: "Connect the Lamden Wallet to Lamden Link",
        type: "wallet",
        wallet: 'lamden',
        component: LamdenWalletStep
    }

    const connectMetaMaskStep = {
        name: "Connect Metamask",
        desc: "Install and connect the Metamask to Lamden Link.",
        type: "wallet",
        wallet: 'metamask',
        network: "ethereum",
        component: MetamaskStep
    }

    const swapStepsMap = {
        'lamden': {
            'ethereum':[
                connectLamdenWalletStep,
                connectMetaMaskStep,
                {
                    name: `Burn Tokens`,
                    desc: `This transaction will burn you tokens on the Lamden Network.  Creating this Proof-of-Burn will allow the tokens to be minted on the Ethereum network.`,
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenBurnStep
                },
                {
                    name: "Withdraw Tokens",
                    desc: "This transaction will use the Proof-of-Burn to from the previous transation to withdraw your tokens on the Ethereum network.",
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumWithdraw
                }
            ]
        },
        'ethereum':{
            'lamden': [
                connectMetaMaskStep,
                connectLamdenWalletStep,
                {
                    name: "Token Approval",
                    desc: "A standard ERC-20 token approval to allow the lamden-link contract to transfer your tokens.",
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumTokenApproval
                },
                {
                    name: "Token Deposit",
                    desc: "This will deposit your tokens in the Lamden Link Contract.",
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumDeposit
                }
            ]
        },
        'binance':{
            'lamden': [
                connectMetaMaskStep,
                connectLamdenWalletStep,
                {
                    name: "Token Approval",
                    desc: "A standard ERC-20 token approval to allow the lamden-link contract to transfer your tokens.",
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumTokenApproval
                },
                {
                    name: "Token Deposit",
                    desc: "This will deposit your tokens in the Lamden Link Contract.",
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumDeposit
                }
            ]
        }
    }

    setContext('process_swap', {
        nextStep,
        setStep,
        done
    })

    const { startOver, goHome } = getContext('current_swap')

    let currentProcessingStep = 0
    let validateStartOver = false
    let processingDone = false
    let copiedSwapInfo = false
    let buttonTimer = null

    let from = $swapInfo.from.toUpperCase()
    let to = $swapInfo.to.toUpperCase()
    let tokenSymbole = $swapInfo.token.symbol

    function getProcessingSteps(){
        let steps = swapStepsMap[$swapInfo.from][$swapInfo.to]
        if ($swapInfo.from === "binance") steps[0].network = "binance"
        else connectMetaMaskStep.network = "ethereum"
        return steps
    }

    function nextStep(){
        let steps = getProcessingSteps()
        let newStep = currentProcessingStep + 1

        if (newStep + 1 > steps.length ) return
        currentProcessingStep = newStep
        scrollToStep()
    }

    function setStep(stepNum) {
        currentProcessingStep = stepNum
        scrollToStep()
    }

    function handleDebugBack(){
        let newStep = currentProcessingStep - 1
        if (newStep >= 0) currentProcessingStep = newStep
        
    }

    function scrollToStep(){
        var elmnt = document.getElementById(`process-step-${currentProcessingStep}`);
        if (elmnt) elmnt.scrollIntoView();
        
    }

    async function done(){
        swapInfo.update(curr => {
            curr.completeDate = new Date()
            curr.networkType = $selectedNetwork
            return curr
        })

        setSwapInHistory($swapInfo)
        navigate("/finish", { replace: true });
    }
    function handleStartOver(){
        if (validateStartOver) startOver()
        validateStartOver = true
    }
    function cancelStartOver(){
        validateStartOver = false
    }

    function handleCopyData(){
        console.log("CLICK")
        copyToClipboard(JSON.stringify($swapInfo))
        copiedSwapInfo = true
        buttonTimer = setTimeout(() => copiedSwapInfo = false, 2000)
    }
</script>

<style>
    h2{
        text-align: center;
    }
    button.copyButton{
        transition: background-color 0.5s ease-in;
    }
    button.copied{
        background-color: var(--success-color-dark);
    }
    .buttons{
        margin: 1rem 0;
    }
    button{
        transition: all 1s ease-in;
        margin: 0 10px;
    }
    .start-over{
        max-width: 650px;
        margin: 0 auto;
        text-align: center;
        line-height: 1.5;
    }
    .start-over > p {
        font-weight: 100;
        font-size: 0.8em;
    }
    .start-over > div{
        margin-top: 2rem;
    }
</style>

{#if $swapInfo}
    <SwapVisual />
{/if}

<div class="buttons flex row just-center">
    <button on:click={goHome}>Home</button>
    {#if !validateStartOver}
        <button class="copyButton" on:click={handleCopyData} class:copied={copiedSwapInfo}>Copy Swap Info</button>
        <button class="secondary" class:warning={validateStartOver} on:click={handleStartOver}>{validateStartOver ? "ARE YOU SURE?" : "Start Swap Over"}</button>
    {/if}
</div>
{#if validateStartOver}
    <h2>Start Swap Over?</h2>
    <div class="start-over text-center">
        <p> Restarting the swap will clear any swap data gathered so far such as amounts and successful transaction hashes.</p>
        <p>Be sure to copy the current swap info for your records before doing this.</p>
        <div class="flex just-center">
            <button class="warning" on:click={handleStartOver}>Start Swap Over</button>
            <button class="copyButton" on:click={handleCopyData} class:copied={copiedSwapInfo}>Copy Swap Info</button>
            <button class="secondary" on:click={cancelStartOver}>Cancel</button>
        </div>

    </div>
{:else}
    <h2>Complete the following steps</h2>
    {#each getProcessingSteps() as stepInfo, index }
        <Step {stepInfo} complete={currentProcessingStep > index} current={currentProcessingStep === index} stepNum={index + 1}/>
    {/each}

{/if}


