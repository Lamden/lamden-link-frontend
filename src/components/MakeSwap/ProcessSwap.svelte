<script>
    import { setContext, getContext } from 'svelte'
    import { navigate } from "svelte-routing";

    // Components
    import Step from './Step.svelte'
    import LamdenWalletStep from '../ProcessingSteps/LamdenWalletStep.svelte'
    import MetamaskStep from '../ProcessingSteps/MetamaskStep.svelte'
    import LamdenBurnStep from '../ProcessingSteps/LamdenBurn.svelte'
    import EthereumWithdraw from '../ProcessingSteps/EthereumWithdraw.svelte'
    import EthereumTokenApproval from '../ProcessingSteps/EthereumTokenApproval.svelte'
    import EthereumDeposit from '../ProcessingSteps/EthereumDeposit.svelte'
    import TWB_EthereumWithdraw from '../ProcessingSteps/TWB_EthereumWithdraw.svelte'
    import LamdenTokenDepositStep from '../ProcessingSteps/LamdenTokenDepositStep.svelte'
    import LamdenMintTokens from '../ProcessingSteps/LamdenMintTokens.svelte'
    import SwapVisual from './SwapVisual.svelte'

    // Misc
    import { selectedNetwork, swapInfo } from '../../stores/globalStores'
    import { setSwapInHistory } from '../../js/localstorage-utils'
    import { copyToClipboard } from '../../js/global-utils'
    import { openURL } from '../../js/global-utils'

    $: hasBurnHash = $swapInfo.burnHash
    $: fromLamden = $swapInfo.from ? $swapInfo.from === "lamden" :  false
    $: origin_lamden = $swapInfo.token.origin_lamden
    $: hasMetamaskApproval = $swapInfo.metamaskApproval

    const connectLamdenWalletStep = {
        name: "Lamden Wallet",
        desc: "Connect the Lamden Wallet to Lamden Link",
        type: "wallet",
        wallet: 'lamden',
        component: LamdenWalletStep
    }

    const connectMetaMaskStep = (network) => Object({
        name: "Connect Metamask",
        desc: "Install and connect the Metamask to Lamden Link.",
        type: "wallet",
        wallet: 'metamask',
        network,
        component: MetamaskStep
    })

    const getSwapSteps = () => { return {
        'lamden': {
            'ethereum':[
                connectLamdenWalletStep,
                connectMetaMaskStep('ethereum'),
                {
                    name: `Burn Tokens`,
                    desc: `This transaction will burn your tokens on the Lamden Network.  Creating this Proof-of-Burn will allow the tokens to be minted on the Ethereum network.`,
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenBurnStep
                },
                {
                    name: "Withdraw Tokens",
                    desc: [
                        "This transaction will use the Proof-of-Burn from the previous transaction to withdraw your tokens on the Ethereum network.",
                        "Be patient and allow the operator to get to your swap. If the Proof-of-Burn is not found, please click the 'Try Again' button."
                    ],
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumWithdraw
                }
            ],
            'binance': origin_lamden ? [
                connectLamdenWalletStep,
                connectMetaMaskStep('binance'),
                {
                    name: "Token Deposit",
                    desc: "This transaction will create a Proof-of-Deposit on the Lamden Blockchain to allow the minting of TAU tokens on the Binance Smart Chain.",
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenTokenDepositStep
                },
                {
                    name: "Withdraw Tokens",
                    desc: [
                        "This transaction will use the Proof-of-Deposit from the previous transaction to withdraw your tokens on the Binance Smart Chain.",
                        "Be patient and allow the operator to get to your swap. If the Proof-of-Deposit is not found, please click the 'Try Again' button."
                    ],
                    type: "transaction",
                    network: 'binance',
                    component: TWB_EthereumWithdraw
                }
            ] :
            [
                connectLamdenWalletStep,
                connectMetaMaskStep('binance'),
                {
                    name: `Burn Tokens`,
                    desc: `This transaction will burn your tokens on the Lamden Network.  Creating this Proof-of-Burn will allow the tokens to be minted on the Binance Smart Chain.`,
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenBurnStep
                },
                {
                    name: "Withdraw Tokens",
                    desc: [
                        "This transaction will use the Proof-of-Burn from the previous transaction to withdraw your tokens on the Binance Smart Chain.",
                        "Be patient and allow the operator to get to your swap. If the Proof-of-Burn is not found, please click the 'Try Again' button."
                    ],
                    type: "transaction",
                    network: 'binance',
                    component: EthereumWithdraw
                }
            ]
            
        },
        'ethereum':{
            'lamden': [
                connectMetaMaskStep('ethereum'),
                connectLamdenWalletStep,
                {
                    name: "Token Approval",
                    desc: [
                        "A standard ERC-20 token approval is needed to give Lamden Link access to your tokens. This step will continue when Lamden Link has detected you have enough allowance to make a deposit.",
                        "Click the 'Create Approval Transaction' button."
                        ],
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumTokenApproval
                },
                {
                    name: "Token Deposit",
                    desc: [
                        "In this step you will lock your tokens in the Ethereum Lamden Link contract.",
                        "Create just ONE Deposit transaction and wait patiently for it to complete.",
                        "Click the 'Create Deposit Transaction' button."
                    ],
                    type: "transaction",
                    network: 'ethereum',
                    component: EthereumDeposit
                },
                {
                    name: "Get Tokens on Lamden",
                    desc: "Lamden Link is checking for your tokens on the Lamden network. Your tokens will be be available after 20 confirmations on the Ethereum network. Please be patient.",
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenMintTokens
                }
            ]
        },
        'binance':{
            'lamden': [
                connectMetaMaskStep('binance'),
                connectLamdenWalletStep,
                {
                    name: "Token Approval",
                    desc: [
                        "A standard BEP-20 token approval is needed to give Lamden Link access to your tokens. This step will continue when Lamden Link has detected you have enough allowance to make a deposit.",
                        "Click the 'Create Token Approval' button."
                        ],
                    type: "transaction",
                    network: 'binance',
                    component: EthereumTokenApproval
                },
                {
                    name: "Token Deposit",
                    desc: [
                        "In this step you will lock your tokens in the Binance Lamden Link contract.",
                        "Create just ONE Deposit transaction and wait patiently for it to complete.",
                        "Click the 'Create Deposit Transaction' button."
                    ],
                    type: "transaction",
                    network: 'binance',
                    component: EthereumDeposit
                },
                {
                    name: "Get Tokens on Lamden",
                    desc: [
                        "Lamden Link is checking for your tokens on the Lamden network. Your tokens will be be available after 20 Binance confirmations. ",
                        "Please be patient."
                    ],
                    type: "transaction",
                    network: 'lamden',
                    component: LamdenMintTokens
                }
            ]
        }
    }}

    setContext('process_swap', {
        nextStep,
        prevStep,
        setStep,
        done,
        restart
    })

    const { goHome } = getContext('current_swap')

    let currentProcessingStep = 0

    function getProcessingSteps(){
        let swapStepsMap = getSwapSteps()
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

    function prevStep(){
        if (currentProcessingStep === 0) return
        let steps = getProcessingSteps()
        let newStep = currentProcessingStep  - 1

        currentProcessingStep = newStep
        scrollToStep()
    }

    function setStep(stepNum) {
        currentProcessingStep = stepNum
        scrollToStep()
    }

    function scrollToStep(){
        // var elmnt = document.getElementById(`process-step-${currentProcessingStep}`);
        var elmnt = document.getElementById(`scroll-here`);
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

    async function restart(){
        navigate("/restart", { replace: true });
    }

    function handleCopyData(){
        copyToClipboard(JSON.stringify($swapInfo))
        copiedSwapInfo = true
        buttonTimer = setTimeout(() => copiedSwapInfo = false, 2000)
    }

    function handleOpenSuport(){
        openURL("https://t.me/lamdenlinksupport")
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


{#if fromLamden && hasBurnHash}
    <h2 id="scroll-here">Resuming {$swapInfo.token.symbol} Swap from {$swapInfo.from} to {$swapInfo.to}</h2>
{:else}
    <h2 id="scroll-here">Complete the following {getProcessingSteps().length} steps</h2>
{/if}
<div class="flex col reverse">
    {#each getProcessingSteps() as stepInfo, index }
        {#if currentProcessingStep >= index}
            <Step {stepInfo} complete={currentProcessingStep > index} current={currentProcessingStep === index} stepNum={index + 1}/>
        {/if}
    {/each}
</div>

{#if (fromLamden && !hasBurnHash) || (!fromLamden && !hasMetamaskApproval)}
    <div class="buttons flex row just-center">
        <button class="warning" on:click={restart}>Restart Swap Process</button>
    </div>
{/if}

<div class="buttons flex row just-center">
    <button on:click={goHome}>Home</button>
    <button on:click={handleOpenSuport} >Get Help</button>
</div>



