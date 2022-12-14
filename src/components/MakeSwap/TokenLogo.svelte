<script>
    import { createEventDispatcher } from 'svelte'

    // Logos
    import Token_WETH from '../Tokens/Token_WETH.svelte'
    import Token_TAU from '../Tokens/Token_TAU.svelte'
    import Token_BDT from '../Tokens/Token_BDT.svelte'
    import Token_ETH from '../Tokens/Token_ETH.svelte'
    import Token_BNB from '../Tokens/Token_BNB.svelte'
    import Token_LUSD from '../Tokens/Token_LUSD.svelte'
    //import Token_USDT from '../Tokens/Token_USDT.svelte'
    //import Token_USDC from '../Tokens/Token_USDC.svelte'
    import Token_BUSD from '../Tokens/Token_BUSD.svelte'
    import Token_DC from '../Tokens/Token_DC.svelte'
    import Token_LIQ from '../Tokens/Token_LIQ.svelte'

    export let token = null;
    export let clickable = true;
    export let size = null;
    export let margin = true

    $: hashTokenInfo = token !== null

    const dispatchEvent = createEventDispatcher();

    const TokenMap = {
        WETH: Token_WETH,
        TAU: Token_TAU,
        DTAU: Token_TAU,
        dTAU: Token_TAU,
        BDT: Token_BDT,
        ETH: Token_ETH,
        TETH: Token_ETH,
        BNB: Token_BNB,
        TBNB: Token_BNB,
        BUSD: Token_BUSD,
        LUSD: Token_LUSD,
        DC: Token_DC,
        LIQ: Token_LIQ
    }

    function handleClick(){
        if (!clickable) return
        dispatchEvent('selected', token)
    }

</script>

<style>
    .container{
        width: 60px;
        height: 60px;
        border: 1px solid var(--accent-color);
        background: var(--accent-color);
        border-radius: 999px;
        margin: 0 10px 0 0;
    }
    .container.tiny{
        width: 30px;
        height: 30px;
    }
    .filled{
        background: var(--color-white);
    }
    .logo{
        min-width: initial;
        width: 54px;
        border-radius: 99px;
        overflow: hidden;
    }
    .logo.tiny{
        min-width: initial;
        width: 16px;
    }
    .no-margin{
        margin: 0;
    }
    @media screen and (min-width: 430px) {

    }
</style>

<button class="not-button flex align-center just-center container" class:no-margin={!margin} class:filled={hashTokenInfo} on:click={handleClick} class:tiny={size === "tiny"}>
    {#if hashTokenInfo}
        <div class="flex align-center just-center logo" class:tiny={size === "tiny"}>
            <svelte:component this={TokenMap[token.symbol]} />
        </div>
    {/if}
</button>


