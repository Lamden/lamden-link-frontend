<script>
    import { createEventDispatcher } from 'svelte'

    // Logos
    import Token_WETH from '../Tokens/Token_WETH.svelte'
    import Token_TAU from '../Tokens/Token_TAU.svelte'
    import Token_BDT from '../Tokens/Token_TAU.svelte'

    export let token = null;
    export let clickable = true;

    $: hashTokenInfo = token !== null

    const dispatchEvent = createEventDispatcher();

    const TokenMap = {
        WETH: Token_WETH,
        TAU: Token_TAU,
        dTAU: Token_TAU,
        BDT: Token_BDT
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
        border-radius: 99px;
        margin: 0 10px;
    }
    .filled{
        background: var(--color-white);
    }
    .logo{
        min-width: initial;
        width: 30px;
    }
    @media screen and (min-width: 430px) {

    }
</style>

<div class="flex align-center just-center container" class:filled={hashTokenInfo} on:click={handleClick}>
    {#if hashTokenInfo}
        <div class="logo">
            <svelte:component this={TokenMap[token.symbol]} />
        </div>
    {/if}
</div>


