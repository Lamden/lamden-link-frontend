<script>
    import { getContext } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { burnTxStatus, burnApprovalTxStatus, lamdenTokenApprovalAmount, lamdenCurrencyBalance } from '../../stores/lamdenStores'
    import { stringToFixed } from '../../js/global-utils'
    import { checkLamdenTokenApproval, sendBurnApproval, startBurn, checkLamdenBalance } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'

    export let current
    export let complete
    export let stepInfo = null;

    const { nextStep } = getContext('process_swap')

    $: hasTokenApproval = $lamdenTokenApprovalAmount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)
    $: burnComplete = $swapInfo.burnHash || false

    async function refreshApprovalAmount(){
        lamdenTokenApprovalAmount.set(await checkLamdenTokenApproval())
    }

    function handleApproveBurn(){
        sendBurnApproval(burnApprovalTxStatus, handleApproveBurnComplete)
    }

    function handleStartBurn(){
        startBurn(burnTxStatus, handleBurnComplete)
    }

    async function handleApproveBurnComplete(txResults){
        lamdenTokenApprovalAmount.set($swapInfo.tokenAmount)
        burnApprovalTxStatus.set({})
        swapInfo.update(curr => {
            curr.burnApproveHash = txResults.txHash
            return curr
        })
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

    function handleBurnComplete(txResults){
        swapInfo.update(curr => {
            curr.burnHash = txResults.txHash
            curr.started = new Date()
            return curr
        })
        saveSwap()
    }
    function handleNextStep(){
        nextStep()
    }
</script>

<style>
    button{
        margin: 0 0 0 auto;
        display: block;
    }

</style>

{#if current || complete}
    <div class="flex row align-center">
        <p class="text-warning"><strong>{burnComplete ? "BURNT" : "BURNING"}</strong></p>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($swapInfo.tokenAmount, 8)} ${$selectedToken.symbol}`}        
    </div> 
    <ul>
        <li class:yes={hasTokenApproval}>
            {#if hasTokenApproval}
                Burn Approved
            {:else}
                Approval Needed
            {/if}
        </li>
        {#if burnComplete}
            <li class:yes={burnComplete}>
                Tokens Burned
            </li>
        {/if}
    </ul>


    {#if !hasTokenApproval}
        <Status statusStore={burnApprovalTxStatus} />
        {#if !$burnApprovalTxStatus.loading}
            <button on:click={handleApproveBurn}>Approve Burn</button>
        {/if}
        
    {/if}

    {#if hasTokenApproval && !burnComplete}
        <Status statusStore={burnTxStatus} />
        {#if !$burnTxStatus.loading}
            <button on:click={handleStartBurn}>Start Burn</button>
        {/if}
        
    {/if}

    {#if burnComplete && current}
        <button class="success" on:click={handleNextStep}>Next Step</button>
    {/if}

    

{/if}