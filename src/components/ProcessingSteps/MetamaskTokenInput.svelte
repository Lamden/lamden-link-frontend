<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import InputNumber from '../InputNumber.svelte'

    // Misc
    import { selectedAccount } from 'svelte-web3'
    import BN from 'bignumber.js'
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { ethChainTokenBalance } from '../../stores/ethereumStores'
    import { stringToFixed } from '../../js/global-utils' 
    import { checkChainTokenBalance } from '../../js/ethereum-utils' 

    export let input = true;
    export let complete = false;

    $: tokensToSend = $swapInfo.tokenAmount || new BN(0)
    $: hasEnoughTokens = $ethChainTokenBalance.isGreaterThanOrEqualTo(tokensToSend)

    let timer = null

    onMount(() => {
        timer = setTimeout(refreshMetaMaskTokenBalance, 10000)
        refreshMetaMaskTokenBalance()

        return () => {
            timer = null
        }
    })

    async function refreshMetaMaskTokenBalance(){
        if (timer === null) return
        if (!$selectedAccount) return
        checkChainTokenBalance()
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
        margin: 2rem 1em 0.25rem 0;
        font-size: 0.8em;
    }

</style>

{#if input}
    <div class="flex row align-center" class:insufficient={!hasEnoughTokens}>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($ethChainTokenBalance, 8)} ${$selectedToken.symbol}`}
    </div>

    <p>How much {$selectedToken.symbol} to send?</p>
    <div class="input-number"><InputNumber on:input={handleInput} disabled={complete}/></div>
{:else}
    <div class="flex row align-center" class:insufficient={!hasEnoughTokens}>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`Resuming Swap for ${tokensToSend} ${$selectedToken.symbol}`}
    </div>

{/if}



