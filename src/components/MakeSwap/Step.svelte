<script>
    import { getContext } from 'svelte';

    // Logos
    import LogoEthereum from '../Logos/LogoEthereum.svelte'
    import LogoBinance from '../Logos/LogoBinance.svelte'
    import LogoLamden from '../Logos/LogoLamden.svelte'

    export let stepInfo
    export let complete
    export let current
    export let stepNum

    $: isMetamaskStep = stepInfo.wallet ? stepInfo.wallet === "metamask" : false

    const LogoMap = {
        ethereum: LogoEthereum,
        binance: LogoBinance,
        lamden: LogoLamden
    }


    function handleClick(){
        console.log("clicked step")
    }

</script>

<style>
    .step-container{
        box-sizing: border-box;
        padding: 1rem;
        margin: 1rem 0;
        width: 100%;
        opacity: 50%;
        border: 2px solid var(--color-gray-2);
        border-radius: 10px;
    }
    .logo-container{
        margin-right: 1rem;
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
        margin: 1rem 30px 0 0 ;
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
<div class="wrapper flex row" id="{`process-step-${stepNum}`}">
    <p class="step-num" class:complete={complete} class:current={current}>{stepNum}</p>
    <div class="step-container" class:complete={complete} class:current={current && !isMetamaskStep} class:metamask={current && isMetamaskStep } >
        <div class="flex row">
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
                {#if stepInfo.component}
                    <svelte:component this={stepInfo.component} {current} {complete} {stepInfo}/>
                {/if}
            </div>
        </div>
    </div>
</div>

