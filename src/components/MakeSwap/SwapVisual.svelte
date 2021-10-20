<script>
    // Components
    import TokenLogo from './TokenLogo.svelte'
    import NetworkLogo from './NetworkLogo.svelte'

    // Icons
    import IconArrowRight from '../SVG/ArrowRightSVG.svelte'

    // Misc
    import { swapInfo } from '../../stores/globalStores'

</script>

<style>
    .container{
        margin: 1rem auto;
    }
    .arrows{
        width: 30px;
        margin: 0 1em;
    }
    .selected-token{
        margin-left: -54px;
    }
    .minted-token{
        z-index: 1;
    }
    .to-logo{
        margin-left: -54px;
    }
</style>

<div class="container flex row align-center">
    <div class="from-logo">
            <NetworkLogo networkName={$swapInfo.from}/>
    </div>

    <div class="selected-token">
        <TokenLogo token={$swapInfo.token} clickable={false}/>
    </div>
    
    <div class="arrows">
        <IconArrowRight />
    </div>

    <div class="minted-token">
        <TokenLogo token={$swapInfo.mintedToken} clickable={false} margin={false}/>
    </div>

    <div class="to-logo">
        <NetworkLogo networkName={$swapInfo.to}/>
    </div>
</div>