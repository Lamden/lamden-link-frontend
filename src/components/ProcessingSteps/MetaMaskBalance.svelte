<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'

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
    a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 40%;
        margin-left: 10px;
        text-decoration: underline;
    }
    a:hover{
        color: var(--color-white);
    }
    div{
        margin-top: 1rem;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={networktoken} size="tiny" clickable={false} />
    <p>{`${stringToFixed($ethChainBalance, 8)} ${$networkInfo.network_symbol}`}</p>
    <a href="{addressURL}" target="_blank" rel="noopener noreferrer">{$selectedAccount}</a>
</div>