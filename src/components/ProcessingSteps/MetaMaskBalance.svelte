<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import ResultLink from '../ResultLink.svelte'

    // Stores
    import { getNetworkStore } from '../../stores/globalStores' 
    import { ethChainBalance } from '../../stores/ethereumStores' 
    import { selectedAccount } from 'svelte-web3'

    // Misc
    import { checkChainBalance } from '../../js/ethereum-utils'
    import { stringToFixed } from '../../js/global-utils'

    export let stepInfo

    let networkInfo = getNetworkStore(stepInfo.network)
    let networktoken = {symbol: $networkInfo.network_symbol}

    $: blockexplorer = `${$networkInfo.blockexplorer}`
    $: addressURL = `${blockexplorer}/${$networkInfo.blockexplorer_address}/${$selectedAccount}`

    onMount(() => {
        checkChainBalance()
    })

</script>

<style>
    div{
        margin-top: 1rem;
    }
    p{
        margin-right: 1em;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={networktoken} size="tiny" clickable={false} />
    <p>{`${stringToFixed($ethChainBalance, 6)} ${$networkInfo.network_symbol}`}</p>
    <ResultLink type="address" hash={$selectedAccount} title={$selectedAccount} network={$networkInfo}/>
</div>