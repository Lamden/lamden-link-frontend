<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenWalletStep from './LamdenWalletStep.svelte'
    import MetamaskStep from './MetamaskStep.svelte'

    // Logos
    import LogoEthereum from '../Logos/LogoEthereum.svelte'
    import LogoBinance from '../Logos/LogoBinance.svelte'
    import LogoLamden from '../Logos/LogoLamden.svelte'

    // Misc
    import { lamden_vk } from '../../stores/lamdenStores.js'
    import { selectedAccount } from 'svelte-web3'

    const { nextStep } = getContext('process_swap')


    export let stepInfo
    export let complete
    export let current
    export let stepNum

    $: isMetamaskStep = stepInfo.wallet ? stepInfo.wallet === "metamask" : false
    $: isLamdenStep = stepInfo.wallet ? stepInfo.wallet === "lamden" : false

    const LogoMap = {
        ethereum: LogoEthereum,
        binance: LogoBinance,
        lamden: LogoLamden
    }


    function handleClick(){
        console.log("clicked step")
    }

    function handleStartStep(){
        stepInfo.start()
    }

    function handleComplete(){
        nextStep()
    }

</script>

<style>
    .step-container{
        padding: 1rem;
        margin: 1rem 0;
        width: 100%;
        opacity: 50%;
        border: 2px solid var(--color-gray-2);
        border-radius: 10px;
    }
    .logo-container{
        margin: 0 25px;
    }
    .step-container.metamask{
        opacity: 100%;
        border: 1px solid #ce8f31;
        background: #311d00;
    }
    .step-container.current{
        opacity: 100%;
        border: 2px solid var(--primary-color);
        background: var(--primary-color-dark);
    }
    .step-container.complete{
        opacity: 100%;
        border: 1px solid var(--success-color);
        background: var(--success-color-darker);
    }

    .logo{
        min-width: initial;
        width: 50px;
    }
    p{
        margin: 0.25 0;
    }
    p.step-name{
        font-weight: 600;
    }
    p.step-desc{
        color: var(--font-primary-dim)
    }
    .buttons{
        text-align: end;
    }
    .step-num{
        opacity: 50%;
        font-size: 50px;
        margin: 0 30px 0 0 ;
    }
    .step-num.current{
        opacity: 100%;
    }
    .step-num.complete{
        opacity: 100%;
        color: var(--success-color);
    }
    @media screen and (min-width: 430px) {

    }
</style>
<div class="wrapper flex row align-center">
    <p class="step-num" class:complete={complete} class:current={current}>{stepNum}</p>
    <div class="step-container" class:complete={complete} class:current={current && !isMetamaskStep} class:metamask={current && isMetamaskStep } >
        <div class="flex row align-center">
            <div class="flex just-center logo-container"  on:click={handleClick}>
                {#if stepInfo.type !== "wallet"}
                    <div class="logo">
                            <svelte:component this={LogoMap[stepInfo.network]} />
                    </div>
                {/if}
            </div>
            <div class="width-100">
                <p class="step-name">{stepInfo.name}</p>
                <p class="step-desc">{stepInfo.desc}</p>
                {#if stepInfo.wallet === "lamden"}
                    <LamdenWalletStep on:walletInstalled={handleComplete} {current}/>
                {/if}
                {#if isMetamaskStep}
                    <MetamaskStep on:walletInstalled={handleComplete} {current}/>
                {/if}
            </div>
        </div>

        {#if stepInfo.type !== "wallet"}
            {#if current && !complete}
                <div class="buttons">
                    <button on:click={handleStartStep} disabled={!current}>Start</button>
                </div>
            {/if}
        {/if}

        {#if $lamden_vk && isLamdenStep}
            <p class="address">{$lamden_vk}</p>
            
        {/if}

        {#if $selectedAccount && isMetamaskStep}
            <p class="address">{$selectedAccount}</p>
        {/if}
    </div>
</div>

