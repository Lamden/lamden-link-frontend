<script>
    import { setContext, onMount } from 'svelte'
    import { writable } from 'svelte/store'

    // Step Components
    import ChooseFromNetwork from './ChooseFromNetwork.svelte'
    import ChooseToNetwork from './ChooseToNetwork.svelte'
    import ChooseToken from './ChooseToken.svelte'
    import ProcessSwap from './ProcessSwap.svelte'

    // Misc
    import * as networks from '../../js/networks.js'
    import { selectedNetwork } from '../../stores/globalStores';

    let swapInfo = writable({})
    let currentStep = 0

    setContext('current_swap', {
        swapInfo,
        fromNetworks: getFromNetworks,
        toNetworks: getToNetworks,
        supportedTokens: getSupportedTokens,
        setStep
    })

    onMount(() => {
        swapInfo.set({
            from: 'lamden',
            to: 'ethereum',
            token: {
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: 'con_weth_lst001'
            }
        })
        setStep(3)
    })


    function getFromNetworks(){
        let network = $selectedNetwork
        if (network === null) network = "mainnet"
        return Object.keys(networks[network])
    }

    function getToNetworks(){
        let network = $selectedNetwork
        if (network === null) network = "mainnet"
        return networks[network][$swapInfo.from].interop
    }

    function getSupportedTokens(){
        let network = $selectedNetwork
        if (network === null) network = "mainnet"
        return networks[network][$swapInfo.from].tokens
    }

    function setStep(step){
        currentStep = step
    }

    let steps = [
        ChooseFromNetwork,
        ChooseToNetwork,
        ChooseToken,
        ProcessSwap
    ]

</script>

<style>
    div{
        width: 100%;
        max-width: 650px;
    }
</style>

<div class="flex col">
    <svelte:component this={steps[currentStep]} />
</div>