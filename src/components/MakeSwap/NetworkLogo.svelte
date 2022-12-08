<script>
    import { createEventDispatcher } from 'svelte'

    // Logos
    import LogoEthereum from '../Logos/LogoEthereum.svelte'
    import LogoBinance from '../Logos/LogoBinance.svelte'
    import LogoLamden from '../Logos/LogoLamden.svelte'

    export let networkName = null;

    $: hasNetworkName = networkName !== null

    const dispatchEvent = createEventDispatcher();

    const LogoMap = {
        ethereum: LogoEthereum,
        binance: LogoBinance,
        lamden: LogoLamden
    }

    function handleClick(){
        dispatchEvent('selected', networkName)
    }

</script>

<style>
    .container{
        width: 120px;
        height: 120px;
        border: 1px solid var(--color-gray-2);
        border-radius: 99px;
        margin: 0 10px;
    }
    .filled{
        border: 1px solid var(--accent-color);
        background: var(--color-white);
    }
    .logo{
        min-width: initial;
        width: 60px;
    }
    @media screen and (min-width: 430px) {

    }
</style>

<button class="not-button flex align-center just-center container" class:filled={hasNetworkName} on:click={handleClick}>
    {#if hasNetworkName}
        <div class="logo">
            <svelte:component this={LogoMap[networkName]} />
        </div>
    {/if}
</button>


