<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import InputNumber from '../InputNumber.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { lamden_vk, lamdenTokenBalance  } from '../../stores/lamdenStores'
    import { checkLamdenTokenBalance } from '../../js/lamden-utils'
    import { stringToFixed, BN } from '../../js/global-utils' 

    export let input = true;
    export let complete = false;

    let timer = null

    $: burnComplete = $swapInfo.burnHash || $swapInfo.depositHash || false
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

        let val = await checkLamdenTokenBalance($lamden_vk)
        lamdenTokenBalance.set(val)
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
        margin: 2rem 0 0.25rem;
        font-size: 0.8em;
    }

</style>


{#if input && !burnComplete}
    <div class="flex row align-center" class:insufficient={!hasEnoughTokens}>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($lamdenTokenBalance, 6)} ${$selectedToken.symbol}`}
    </div>

    <p>How much {$selectedToken.symbol} to send?</p>
    <div class="input-number">
        <InputNumber on:input={handleInput} disabled={complete} startingValue={$swapInfo.tokenAmount ? $swapInfo.tokenAmount.toString() : ""}/>
     </div>
{/if}

{#if burnComplete}
    <div class="flex row align-center" class:insufficient={!hasEnoughTokens}>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`Resuming Swap for ${tokensToSend} ${$selectedToken.symbol}`}
    </div>
{/if}



