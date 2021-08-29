<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import InputNumber from '../InputNumber.svelte'

    // Misc
    import BN from 'bignumber.js'
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { lamden_vk, lamdenTokenBalance  } from '../../stores/lamdenStores'
    import { checkLamdenTokenBalance } from '../../js/lamden-utils'
    import { stringToFixed } from '../../js/global-utils' 

    export let input = true;

    let timer = null

    $: burnComplete = $swapInfo.burnHash || false
    $: tokensToSend = $swapInfo.tokenAmount || new BN(0)
    $: hasEnoughTokens = $lamdenTokenBalance.isGreaterThanOrEqualTo(tokensToSend)

    onMount(() => {
        timer = setTimeout(refreshLamdenTokenBalance, 10000)
        refreshLamdenTokenBalance()

        return () => {
            timer = null
        }
    })

    async function refreshLamdenTokenBalance(){
        if (timer === null) return
        if (!$lamden_vk) return
        lamdenTokenBalance.set(await checkLamdenTokenBalance($lamden_vk))
    }

    function handleInput(e){
        swapInfo.update(curr => {
            curr.tokenAmount = e.detail
            return curr
        })
    }

</script>

<style>
    .insufficient{
        color: var(--warning-color);
    }
    p{
        margin: 1rem 0 0.25rem;
    }
</style>

<div class="flex row align-center" class:insufficient={!hasEnoughTokens}>
    <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
    {`${stringToFixed($lamdenTokenBalance, 8)} ${$selectedToken.symbol}`}
</div>

{#if input && !burnComplete}
    <p>Amount of {$selectedToken.symbol} to send:</p>
    <div class="input-number"><InputNumber on:input={handleInput}/></div>
{/if}


