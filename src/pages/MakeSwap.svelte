<script>
    import { setContext, onMount } from 'svelte'
    import { navigate } from "svelte-routing";

    // Step Components
    import ChooseFromNetwork from '../components/MakeSwap/ChooseFromNetwork.svelte'
    import ChooseToNetwork from '../components/MakeSwap/ChooseToNetwork.svelte'
    import ChooseToken from '../components/MakeSwap/ChooseToken.svelte'
    import ProcessSwap from '../components/MakeSwap/ProcessSwap.svelte'

    // Misc
    import * as networks from '../js/networks'
    import { selectedNetwork, swapInfo, maintenance_unlocked } from '../stores/globalStores'
    import { getLastSwap, clearCurrentSwap } from '../js/localstorage-utils';

    export let testnet

    let currentStep = 0

    setContext('current_swap', {
        fromNetworks: getFromNetworks,
        toNetworks: getToNetworks,
        supportedTokens: getSupportedTokens,
        setStep,
        startOver,
        goHome: handleGoHome
    })

    onMount(() => {
        if (testnet) set_testnet()

        let lastSwapInfo = getLastSwap()
        if (!lastSwapInfo) lastSwapInfo = {}
        if (!lastSwapInfo.to && !lastSwapInfo.from && !lastSwapInfo.token){
            // Do nothing
        }else{
            swapInfo.set(lastSwapInfo)
            setStep(3)
        }
    })


    function getFromNetworks(){
        return Object.keys(networks[$selectedNetwork]).filter(k => k !== "bridges" && k !== "ethereum" && k !== "binance")
    }

    function getToNetworks(){
        return networks[$selectedNetwork][$swapInfo.from].interop.filter(k => k !== "ethereum")
    }

    function getSupportedTokens(){
        return networks[$selectedNetwork][$swapInfo.from].tokens[$swapInfo.to]
    }

    function setStep(step){
        currentStep = step
    }

    function set_testnet(){
        selectedNetwork.set('testnet')
    }

    function set_mainnet(){
        selectedNetwork.set('mainnet')
    }
    
    function startOver(){
        clearCurrentSwap()
        setStep(0)
    }

    let steps = [
        ChooseFromNetwork,
        ChooseToNetwork,
        ChooseToken,
        ProcessSwap
    ]

    function handleGoHome(){
        navigate("/", { replace: true });
    }

</script>

<style>
    .page-container{
        margin: 0 auto;
    }
    div{
        width: 100%;
    }
</style>

<div class="page-container">
    {#if $maintenance_unlocked && $selectedNetwork === 'mainnet'}
        <button on:click={set_testnet}>Testnet</button>
    {/if}

    {#if $maintenance_unlocked && $selectedNetwork === 'testnet'}
        <button on:click={set_mainnet}>Mainnet</button>
    {/if}

    <div class="flex col">
        <svelte:component this={steps[currentStep]} />
    </div>
</div>