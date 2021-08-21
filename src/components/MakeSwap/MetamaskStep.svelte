<script>
    import { getContext} from 'svelte';
    import { ethStore, connected, selectedAccount } from 'svelte-web3'

    // Misc
    import * as networks from '../../js/networks.js';
    import { selectedNetwork } from '../../stores/globalStores.js';

    export let current

    let metamaskError = false

    const { nextStep } = getContext('process_swap')

    async function connectMetamask(event) {
        try {
            await ethStore.setBrowserProvider()
        } catch (error) {
            if (error.code === -32002) {
                metamaskError = 'Please open metamask and accept the connection request.'
            } else if (error.code === 4001) {
                metamaskError = 'Request Rejected.'
            } else {
                metamaskError = 'Something went wrong.'
            }
        }
    }

</script>


<style>
    ul{
        margin: 0;
    }
    li {
        color: var(--warning-color);
        list-style-image: url("/static/images/icons/icon_nope.svg");
    }

    li.yes {
        color: var(--success-color);
        list-style-image: url("/static/images/icons/icon_check.svg");
    }

    button{
        display: block;
        margin: 0 0 0 auto;
    }

    @media screen and (min-width: 430px) {

    }
</style>


<ul>
    <li class:yes={$connected && !metamaskError}>
        {#if !$connected}
            {#if metamaskError}
                {metamaskError}.
            {:else}
                Not Connected
            {/if}
        {:else}
            Installed and Connected
        {/if}
    </li>
</ul>

{#if current}
    {#if $connected && $selectedAccount}
        <button on:click={nextStep}>Next Step</button>
    {:else}
        <button on:click={connectMetamask}>Connect To MetaMask</button>
    {/if}
{/if}
