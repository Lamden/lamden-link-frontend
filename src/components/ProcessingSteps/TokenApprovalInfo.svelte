<script>
    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import IconCheckmark from '../SVG/CheckmarkSVG.svelte'
    import ResultLink from '../ResultLink.svelte'



    // Misc
    import { selectedToken, swapInfo, networkInfo } from '../../stores/globalStores'
    import { stringToFixed } from '../../js/global-utils' 


</script>

<style>
    div{
        margin-top: 0.5rem;
        color: var(--success-color);
    }
    .icon{
        width: 1.5em;
        margin-right: 0.5em;
    }
    span{
        margin-right: 1em;
    }
</style>


<div class="flex row align-center">
    <div class="icon">
        <IconCheckmark />
    </div>
   
    <span>Approval sent</span>

    <ResultLink type="address" hash={$swapInfo.metamaskApproval} title={$swapInfo.metamaskApproval} network={$networkInfo}/>
</div>


