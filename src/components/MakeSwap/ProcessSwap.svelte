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
    import { getNetworkStore, selectedNetwork, swapInfo } from '../../stores/globalStores'
    import { setSwapInHistory, clearCurrentSwap } from '../../js/localstorage-utils'

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
</script>

<style>
    h2{
        text-align: center;
    }
    .buttons{
        margin: 1rem 0;
    }
    button{
        margin: 0 10px;
    }
</style>

{#if $swapInfo}
    <SwapVisual />
{/if}

<div class="buttons flex row just-center">
    <button class="secondary" class:warning={validateStartOver} on:click={handleStartOver}>{validateStartOver ? "ARE YOU SURE?" : "Start Swap Over"}</button>
    <button on:click={goHome}>Home</button>
</div>

<h2>Complete the following steps</h2>
{#each getProcessingSteps() as stepInfo, index }
    <Step {stepInfo} complete={currentProcessingStep > index} current={currentProcessingStep === index} stepNum={index + 1}/>
{/each}
