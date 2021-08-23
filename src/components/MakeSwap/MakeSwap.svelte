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
    import { selectedNetwork, swapInfo } from '../../stores/globalStores';
    import { getLastSwap } from '../../js/localstorage-utils';

    let currentStep = 0

    setContext('current_swap', {
        fromNetworks: getFromNetworks,
        toNetworks: getToNetworks,
        supportedTokens: getSupportedTokens,
        setStep
    })

    onMount(() => {
        swapInfo.set({
                from: 'ethereum',
                to: 'lamden',
                token: {
                    name: "Wrapped Ethereum",
                    symbol: 'WETH',
                    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                    decimals: 18
                }
            })
            setStep(3)
        return
        let lastSwapInfo = getLastSwap()
        if (lastSwapInfo){
            swapInfo.set(lastSwapInfo)
        }else{
            swapInfo.set({
                from: 'lamden',
                to: 'ethereum',
                token: {
                    name: "Wrapped Ethereum",
                    symbol: 'WETH',
                    address: 'con_weth_lst001_v1'
                }
            })
        }
        console.log($swapInfo)
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

    function saveSwapData(){

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