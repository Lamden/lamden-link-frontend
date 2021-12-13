<script>
    import { get } from "svelte/store";

    // Components
    import Loader from '../Loader.svelte'

    // Icons
    import IconInfo from '../SVG/InfoSVG.svelte'
    import IconError from '../SVG/ErrorSVG.svelte'

    // Misc
    import { openURL } from '../../js/global-utils'
    import { getNetworkStore } from '../../stores/globalStores'

    export let statusStore
    export let txHash = null;
    export let networkName;

    function handleOpenSuport(){
        openURL("https://t.me/lamdenlinksupport")
    }
    function handleOpenTxHash(){
        if (!networkName || !txHash) return
        let network = get(getNetworkStore(networkName))
        if (!network) return

        txHash = "0xb832db81f781ceb585691d4023ee6367dbee7d16cb2bfc5dd19d98b5aecaa4b7"
        openURL(`${network.blockexplorer}/${network.blockexplorer_tx}/${txHash}`)
    }

</script>

<style>
    .icon{
        margin-right: 20px;
        width: 1.5em;
        min-width: 1.5em;
    }
    .text-error{
        overflow: hidden;
        overflow-wrap: anywhere;
    }
    button{
        margin-left: 1em;
    }
</style>

{#if $statusStore.loading}
    <div class="flex row align-center">
        <Loader />
        <p>{$statusStore.status}</p>
    </div>
{/if}

{#if $statusStore.errors}
    <div class="flex row align-center">
        <div class="icon">
            <IconError />
        </div>
        {#each $statusStore.errors as error}
            <p class="text-error">{error}</p>
        {/each}
    </div>  
    <div class="flex row">
        {#if networkName && txHash}
            <button on:click={handleOpenTxHash}>View Transaction</button>
        {/if}
    </div>
{/if}

{#if $statusStore.message}
    <div class="flex row align-center">
        <div class="icon text-error">
            <IconInfo />
        </div>
        <p>{$statusStore.message}</p>
    </div>
{/if}


