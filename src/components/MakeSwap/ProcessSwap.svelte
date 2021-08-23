<script>
    import { setContext } from 'svelte'
    import { navigate } from "svelte-routing";

    // Components
    import Step from './Step.svelte'
    import LamdenWalletStep from '../ProcessingSteps/LamdenWalletStep.svelte'
    import MetamaskStep from '../ProcessingSteps/MetamaskStep.svelte'
    import LamdenBurnStep from '../ProcessingSteps/LamdenBurn.svelte'
    import EthereumWithdraw from '../ProcessingSteps/EthereumWithdraw.svelte'

    // Misc
    import { swapInfo } from '../../stores/globalStores'

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
                    network: 'ethereum'
                },
                {
                    name: "Token Deposit",
                    desc: "This will deposit your tokens in the Lamden Link Contract.",
                    type: "transaction",
                    network: 'ethereum'
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
                    network: 'ethereum'
                },
                {
                    name: "Token Deposit",
                    desc: "This will deposit your tokens in the Lamden Link Contract.",
                    network: 'ethereum'
                },
                {
                    name: "Get Tokens",
                    desc: "This step will wait for confirmation that the tokens have been sent to you on the Lamden Blockchain.",
                    network: 'lamden'
                }
            ]
        }
    }

    setContext('process_swap', {
        nextStep,
        setStep,
        done
    })

    let currentProcessingStep = 0

    function getProcessingSteps(){
        let steps = swapStepsMap[$swapInfo.from][$swapInfo.to]
        if (swapInfo.from === "binance") steps[0].network = "binance"
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

    function done(){
        navigate("/results", { replace: true });
    }
</script>

<style>
    h2{
        text-align: center;
    }
</style>

<h2>Let's Go!</h2>
{#each getProcessingSteps() as stepInfo, index }
<Step {stepInfo} complete={currentProcessingStep > index} current={currentProcessingStep === index} stepNum={index + 1}/>
{/each}