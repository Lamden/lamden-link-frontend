<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'

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
        width: max-content;
    }
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
</style>

<div class="flex row align-center">
    <TokenLogo token={lamdenToken} clickable={false} size="tiny" />
    <p>{`${stringToFixed($lamdenCurrencyBalance, 8)} ${$networkInfo.network_symbol}`}</p>
    <a href="{addressURL}" target="_blank" rel="noopener noreferrer">{$lamden_vk}</a>
</div>