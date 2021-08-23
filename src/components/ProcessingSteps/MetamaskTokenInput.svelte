<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import InputNumber from '../InputNumber.svelte'

    // Misc
    import { selectedAccount } from 'svelte-web3'
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { ethChainTokenBalance } from '../../stores/ethereumStores'
    import { stringToFixed } from '../../js/global-utils' 
    import { checkChainTokenBalance } from '../../js/ethereum-utils' 

    export let input = true;

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

<div class="flex row align-center">
    <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
    {`${stringToFixed($ethChainTokenBalance, 8)} ${$selectedToken.symbol}`}
</div>

{#if input}
    <p>Amount of {$selectedToken.symbol} to send:</p>
    <div class="input-number"><InputNumber on:input={handleInput}/></div>
{/if}


