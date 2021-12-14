<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import ResultLink from '../ResultLink.svelte'

    // Stores
    import { lamden_vk, lamdenCurrencyBalance } from '../../stores/lamdenStores' 
    import { getNetworkStore } from '../../stores/globalStores' 

    // Misc
    import { checkLamdenBalance } from '../../js/lamden-utils'
    import { stringToFixed } from '../../js/global-utils'

    let timer = null
    let networkInfo = getNetworkStore("lamden")

    let lamdenToken = {symbol: $networkInfo.network_symbol}

    $: blockexplorer = `${$networkInfo.blockexplorer}`
    $: addressURL = `${blockexplorer}/${$networkInfo.blockexplorer_address}/${$lamden_vk}`

    onMount(() => {
        
        timer = setTimeout(refreshLamdenBalance, 10000)
        refreshLamdenBalance()

        return () => {
            timer = null
        }
    })

    async function refreshLamdenBalance(){
        if (timer === null) return
        if (!$lamden_vk) return
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

</script>

<style>
    p{
        margin-right: 1em;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={lamdenToken} clickable={false} size="tiny" />
    <p>{`${stringToFixed($lamdenCurrencyBalance, 6)} ${$networkInfo.network_symbol}`}</p>
    <ResultLink type="address" hash={$lamden_vk} title={$lamden_vk} network={$networkInfo}/>
</div>