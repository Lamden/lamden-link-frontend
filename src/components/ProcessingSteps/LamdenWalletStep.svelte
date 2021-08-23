<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenBalance from '../ProcessingSteps/LamdenBalance.svelte'
    import LamdenTokenInput from '../ProcessingSteps/LamdenTokenInput.svelte'

    // Misc
    import BN from 'bignumber.js'
    import WalletController from 'lamden_wallet_controller';
    import { selectedNetwork, lamdenNetwork, swapInfo } from '../../stores/globalStores.js';
    import { lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenTokenBalance } from '../../stores/lamdenStores.js';
    import { checkLamdenTokenApproval } from '../../js/lamden-utils'

    export let current
    export let complete

    $: notAttempted = $lamdenWalletInfo.installed === undefined
    $: installed = $lamdenWalletInfo.installed || false
    $: connected = $hasNetworkApproval.approved || false
    $: locked = connected ? $lamdenWalletInfo.locked === true : true
    $: tokenFromMe = $swapInfo.from === "lamden"
    $: tokensToSend = $swapInfo.tokenAmount || new BN(0)
    $: hasEnoughTokens = tokensToSend.isGreaterThan(0) && $lamdenTokenBalance.isGreaterThanOrEqualTo(tokensToSend)

    const { nextStep } = getContext('process_swap')

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
        return $lamdenNetwork.clearingHouse
    }

	const handleWalletInfo = (info) => {
        if (Object.keys(info.approvals).includes($selectedNetwork)){
            hasNetworkApproval.set({approved: true})
            lamden_vk.set($lwc.walletAddress)
        }
		lamdenWalletInfo.set(info)
    }

    const sendLamdenApproval = () => {
        $lwc.sendConnection()
    }
    async function handleNextStep(){
        await checkLamdenTokenApproval()
        swapInfo.update(curr => {
            curr.lamden_address
            return
        })
        nextStep()
    }
</script>


<style>
    .wrapper{
        width: 100%;
    }
    ul{
        margin: 0;
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
    @media screen and (min-width: 430px) {

    }
</style>

{#if current || complete}
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

            {#if $lamden_vk}
                <li class="no-bullet">
                    <LamdenBalance />
                </li>
            {/if}

            {#if $lamden_vk && tokenFromMe}
                <li class="no-bullet">
                    <LamdenTokenInput />
                </li>
            {/if}

        </ul>
        <div class="flex row align-center just-end buttons">
            {#if current}
                {#if notAttempted}
                    <button on:click={checkIfWalletIsInstalled}>Connect To Lamden Wallet</button>
                {:else}
                    {#if !installed}
                        <a class="install" href="{$lamdenNetwork.wallet_install_url}" target="_blank" rel="noopener noreferrer">Click to Install Lamden Wallet</a> 
                    {/if}
                    
                    {#if installed && !connected}
                        <button on:click={sendLamdenApproval}>Create Linked Account</button>
                    {/if}
                    
                    {#if $lamden_vk && current}
                        {#if tokenFromMe}
                            <button disabled={!hasEnoughTokens} on:click={handleNextStep}>Next Step</button>
                        {:else}
                            <button on:click={handleNextStep}>Next Step</button>
                        {/if}
                    {/if} 
                {/if}
            {/if}
        </div>

    </div>
{/if}