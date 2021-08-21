<script>
    import { onMount, getContext } from 'svelte';

    // Misc
    import WalletController from 'lamden_wallet_controller';
    import * as networks from '../../js/networks.js';
    import { selectedNetwork } from '../../stores/globalStores.js';
	import { lamdenWalletInfo, lamden_vk, lwc } from '../../stores/lamdenStores.js';

    export let current

    $: notAttempted = $lamdenWalletInfo.installed === undefined
    $: installed = $lamdenWalletInfo.installed || false
    $: connected = installed ? $lwc.approved : false
    $: locked = connected ? $lamdenWalletInfo.locked === true : true

    const { nextStep } = getContext('process_swap')

    const storeURL = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"

	onMount(() => {
        lwc.set(new WalletController(getApprovalRequest()))

        $lwc.events.on('newInfo', handleWalletInfo)

		return () => {
			$lwc.events.removeListener(handleWalletInfo)
		}
    })
    function checkIfWalletIsInstalled(){
		$lwc.walletIsInstalled()
    }

    function getApprovalRequest(){
        let network = $selectedNetwork
        if (!network) network = "mainnet"
        return networks[network].lamden.clearingHouse
    }

	const handleWalletInfo = (info) => {
		lamden_vk.set($lwc.walletAddress)
		lamdenWalletInfo.set(info)
    }

    const sendLamdenApproval = () => {
        $lwc.sendConnection()
    }
</script>


<style>
    .wrapper{
        width: 100%;
    }
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
    a{
        color: var(--font-primary);
        text-decoration: underline;
        cursor: pointer;
    }
    a.install{
        display: block;
        margin-top: 1rem;
    }
    a:hover{
        color: var(--accent-color);
    }
    a:visited{
        color: var(--font-primary);
    }
    button{
        display: block;
        margin: 0 0 0 auto;
    }

    @media screen and (min-width: 430px) {

    }
</style>

<div class="wrapper">
    <ul>
        <li class:yes={installed}>
            {#if !installed}
                {#if notAttempted}
                    Not Connected
                {:else}
                    Not Installed
                {/if}
            {:else}
                Installed
            {/if}
        </li>
    
        {#if installed}
            <li class:yes={connected}>
                {#if !connected}
                    Lamden Link Not Connected
                {:else}
                    Connected to Lamden Link
                {/if}
            </li>
        {/if}
    
        {#if installed && connected}
            <li class:yes={!locked}>
                {#if !locked}
                    Wallet Unlocked 
                {:else}
                    Wallet is Locked
                {/if}
            </li>
        {/if}
    </ul>

    {#if current}
        {#if notAttempted}
            <button on:click={checkIfWalletIsInstalled}>Connect To Lamden Wallet</button>
        {:else}
            {#if !installed}
                <a class="install" href="{storeURL}" target="_blank" rel="noopener noreferrer">Click to Install Lamden Wallet</a> 
            {/if}
            
            {#if installed && !connected}
                <button on:click={sendLamdenApproval}>Create Linked Account</button>
            {/if}
            
            {#if $lamden_vk && current}
                <button on:click={nextStep}>Next Step</button>
            {/if} 
        {/if}
    {/if}   
</div>
