<script>
    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { stringToFixed } from '../../js/global-utils' 


</script>

<style>
    div{
        margin-top: 1rem;
        color: var(--success-color);
    }
</style>


<div class="flex row align-center">
    <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
    {`Approved to send ${stringToFixed($swapInfo.tokenAmount, 8)} ${$selectedToken.symbol}`}
</div>


