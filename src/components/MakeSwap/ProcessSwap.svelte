<script>
    import { getContext, setContext } from 'svelte'

    // Components
    import Step from './Step.svelte'

    // Misc
    import { start_burn } from '../../js/lamden-utils'

    const connectLamdenWalletStep = {
        name: "Lamden Wallet",
        desc: "Connect the Lamden Wallet to Lamden Link",
        type: "wallet",
        wallet: 'lamden'
    }

    const connectMetaMaskStep = {
        name: "Connect Metamask",
        desc: "Install and connect the Metamask to Lamden Link.",
        type: "wallet",
        wallet: 'metamask'
    }

    const swapStepsMap = {
        'lamden': {
            'ethereum':[
                {
                    name: "Burn Tokens",
                    desc: "This transaction will burn the selected token on the Lamden Network and create a Proof-of-Burn.",
                    type: "transaction",
                    network: 'lamden',
                    start: start_burn
                },
                {
                    name: "Withdraw Tokens",
                    desc: "This transaction will use the Proof-of-Burn to from the previous transation to withdraw your tokens on the Ethereum network.",
                    type: "transaction",
                    network: 'ethereum'
                },
                {
                    name: "Get Tokens",
                    desc: "This step will wait for confirmation that your tokens have been sent to you on the Ethereum blockchian.",
                    type: "check",
                    network: 'ethereum'
                }
            ]
        },
        'ethereum':{
            'lamden': [
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
                },
                {
                    name: "Get Tokens",
                    desc: "This step will wait for confirmation that the tokens have been minted in the Lamden Blockchain.",
                    type: "check",
                    network: 'lamden'
                }
            ]
        },
        'binance':{
            'lamden': [
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
        nextStep
    })

    let currentProcessingStep = 0

    const { swapInfo } = getContext('current_swap')

    function getProcessingSteps(){
        return [connectLamdenWalletStep, connectMetaMaskStep, ...swapStepsMap[$swapInfo.from][$swapInfo.to]]
    }

    function nextStep(){
        let steps = getProcessingSteps()
        let newStep = currentProcessingStep + 1
        console.log({newStep})
        if (newStep + 1 > steps.length ) return
        currentProcessingStep = newStep
        console.log({newStep, currentProcessingStep})
    }
    function handleDebugBack(){
        let newStep = currentProcessingStep - 1
        if (newStep >= 0) currentProcessingStep = newStep
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
<button on:click={nextStep}>Debug Next</button>
<button on:click={handleDebugBack}>Debug Back</button>