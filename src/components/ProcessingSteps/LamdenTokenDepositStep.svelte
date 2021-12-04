<script>
    import { getContext, onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { depositTxStatus, depositApprovalTxStatus, lamdenTokenApprovalAmount, lamdenCurrencyBalance } from '../../stores/lamdenStores'
    import { stringToFixed } from '../../js/global-utils'
    import { sendDepositApproval, startDeposit, checkLamdenBalance } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'

    export let current
    export let complete
    export let stepInfo = null;

    const { nextStep } = getContext('process_swap')


    $: hasTokenApproval = $lamdenTokenApprovalAmount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)
    $: depositComplete = $swapInfo.depositHash || false
    $: autoNext = depositComplete ? handleNextStep() : null

    function handleApproveDeposit(){
        sendDepositApproval(depositApprovalTxStatus, handleApproveDepositComplete)
    }

    function handleStartDeposit(){
        startDeposit(depositTxStatus, handleDepositComplete)
    }

    async function handleApproveDepositComplete(txResults){
        lamdenTokenApprovalAmount.set($swapInfo.tokenAmount)
        depositApprovalTxStatus.set({})
        swapInfo.update(curr => {
            curr.depositApproveHash = txResults.txHash
            return curr
        })
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

    function handleDepositComplete(txResults){
        swapInfo.update(curr => {
            curr.depositHash = txResults.txHash
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
    strong{
        margin-right: 1em;
    }

</style>

{#if current || complete}
    <ul>
        <li class:yes={hasTokenApproval || depositComplete}>
            <span>
                {#if hasTokenApproval || depositComplete}
                    Deposit Approved
                {:else}
                    Approval Needed
                {/if}
            </span>
        </li>
        {#if depositComplete}
            <li class:yes={depositComplete}>
                <span>Tokens Deposited</span>
            </li>
        {/if}
    </ul>

    <div class="flex row align-center">
        <p class="text-warning"><strong>{depositComplete ? "Deposited" : "Depositing"}</strong></p>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($swapInfo.tokenAmount, 8)} ${$selectedToken.symbol}`}        
    </div> 


    {#if !hasTokenApproval && !depositComplete}
        <Status statusStore={depositApprovalTxStatus} />
        {#if !$depositApprovalTxStatus.loading}
            <button on:click={handleApproveDeposit}>Approve Deposit</button>
        {/if}
        
    {/if}

    {#if hasTokenApproval && !depositComplete}
        <Status statusStore={depositTxStatus} />
        {#if !$depositTxStatus.loading}
            <button on:click={handleStartDeposit}>Start Deposit</button>
        {/if}
        
    {/if}

    {#if depositComplete && current}
        <button class="success" on:click={handleNextStep}>Next Step</button>
    {/if}

    

{/if}