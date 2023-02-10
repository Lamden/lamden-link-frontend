<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenBalance from '../ProcessingSteps/LamdenBalance.svelte'
    import LamdenTokenInput from '../ProcessingSteps/LamdenTokenInput.svelte'

    // Misc
    import WalletController from 'lamden_wallet_controller';
    import { selectedNetwork, lamdenNetwork, swapInfo } from '../../stores/globalStores.js';
    import { lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenTokenBalance, isTrackedAddress } from '../../stores/lamdenStores.js';
    import { checkLamdenTokenApproval } from '../../js/lamden-utils'
    import { BN } from '../../js/global-utils'

    export let current
    export let complete

    $: depositComplete = $swapInfo.ethDepositTxHash || false
    $: notAttempted = $lamdenWalletInfo.installed === undefined
    $: installed = $lamdenWalletInfo.installed || false
    $: connected = $hasNetworkApproval.approved || false
    $: locked = connected ? $lamdenWalletInfo.locked === true : true
    $: tokenFromMe = $swapInfo.from === "lamden"
    $: tokensToSend = $swapInfo.tokenAmount || new BN(0)
    $: hasEnoughTokens = tokensToSend.isGreaterThan(0) && $lamdenTokenBalance.isGreaterThanOrEqualTo(tokensToSend)
    $: resuming = $swapInfo.burnHash || $swapInfo.depositHash || false

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
        return $lamdenNetwork.walletConnection
    }

	const handleWalletInfo = (info) => {
        const approvalRequest = getApprovalRequest()
        const { networkName } = approvalRequest

        if (info.approvals && networkName){
            const net_name = info.approvals[networkName]
            if (net_name){
                if (Object.keys(net_name).includes($selectedNetwork)){
                    hasNetworkApproval.set({approved: true})
                    lamden_vk.set($lwc.walletAddress)
                }
            }
        }
        if (!info.errors){
            lamdenWalletInfo.set(info)
        }
		
    }

    const sendLamdenApproval = () => {
        $lwc.sendConnection()
    }

    async function handleNextStep(){
        swapInfo.update(curr => {
            curr.lamden_address = $lamden_vk
            return curr
        })
        getAllowanceAndNext()
    }

    async function getAllowanceAndNext(){
        if (tokenFromMe) await checkLamdenTokenApproval()
        nextStep()
    }

    function handleResumeSwap(){
        let agree = confirm("If you have not started swap yet click CANCEL.\n\nClick OK if you have a burn or depost hash you need to redeem.")
        if (!agree) return
        handleNextStep()
    }

</script>


<style>
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
    button{
        min-width: fit-content;
        margin-left: 1rem;
    }
    ul{
        margin: 2rem 0;
    }
    @media screen and (min-width: 430px) {

    }
</style>

{#if current || complete}
    <ul>
        <li class:yes={installed}> 
            <span>
                {#if !installed}
                    {#if notAttempted}
                        Not Connected
                    {:else}
                        Not Installed
                    {/if}
                {:else}
                    Installed
                {/if}
            </span>
        </li>

        {#if installed}
            <li class:yes={!locked}>
                <span>
                    {#if !locked}
                        Wallet Unlocked 
                    {:else}
                        Wallet is Locked
                    {/if}
                </span>
            </li>
        {/if}
    
        {#if installed}
            <li class:yes={connected}>
                <span>
                    {#if !connected}
                        Lamden Link Not Connected
                    {:else}
                        Connected to Lamden Link
                    {/if}
                </span>
            </li>
        {/if}
    </ul>

    {#if $lamden_vk}
            <LamdenBalance />
    {/if}

    {#if $lamden_vk && tokenFromMe}
        {#if !depositComplete}
                <LamdenTokenInput {complete}/>
        {/if}
    {/if}

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
                
                {#if $lamden_vk && current && !$isTrackedAddress}
                    {#if tokenFromMe}
                        <button class:success={ hasEnoughTokens } disabled={!hasEnoughTokens && !resuming } on:click={handleNextStep}>
                            {resuming ? "Resume Swap" : "Start New Swap"}
                        </button>
                        {#if !resuming}
                            <button disabled={$swapInfo.tokenAmount ? $swapInfo.tokenAmount.isGreaterThan(0) ? false : true : true} on:click={handleResumeSwap}>
                                Resume Swap
                            </button>
                        {/if}
                    {:else}
                        <button class="success" on:click={handleNextStep}>Next Step</button>
                    {/if}
                {/if}
                {#if $lamden_vk && $isTrackedAddress}
                    <p class="text-warning">
                        The Lamden Wallet provided the address value of "tracked_addess".  
                        This is because you have selected a watched account from your Dapp connection settings.  
                        Please selected a different account in your Lamden Wallet Dapp settings.
                    </p>
                    <button  disabled>Unsupported Account</button>
                {/if}
            {/if}
        {/if}
        
    </div>
{/if}