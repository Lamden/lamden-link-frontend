<script>
    import { getContext, onMount } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { depositTxStatus, depositApprovalTxStatus, lamdenTokenApprovalAmount, lamdenCurrencyBalance } from '../../stores/lamdenStores'
    import { stringToFixed } from '../../js/global-utils'
    import { sendDepositApproval, startDeposit, checkLamdenBalance, checkLamdenDepositTransaction } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'

    export let current
    export let complete
    export const stepInfo = null;

    let skipApproval = false

    const { nextStep } = getContext('process_swap')

    $: hasTokenApproval = $lamdenTokenApprovalAmount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)
    $: depositComplete = $swapInfo.depositSuccess || false
    $: hasDepositHash = $swapInfo.depositHash || false

    function handleSkipApprove(){
        depositTxStatus.set({})
        skipApproval = true
    }

    function handleApproveDeposit(){
        depositApprovalTxStatus.set({})
        depositTxStatus.set({})
        sendDepositApproval(depositApprovalTxStatus, handleApproveDepositComplete)
    }

    function handleStartDeposit(){
        if ($swapInfo.depositHash){
            let agree = confirm("Lamden Link has detected that you already created a deposit transaction for this swap.\nCreating a second deposit transaction will almost always result in loss of funds.\n\nClick the OK button if your previous Deposit Transaction failed and you would like to create a new one.\nClick CANCEL if you have a pending Deposit Transaction.");
            if (!agree) return
        }
        startDeposit(depositTxStatus, handleDepositComplete)
    }

    async function handleApproveDepositComplete(txResults){
        lamdenTokenApprovalAmount.set($swapInfo.tokenAmount)
        depositApprovalTxStatus.set({})
        swapInfo.update(curr => {
            curr.depositApproveHash = txResults.txHash
            return curr
        })
        saveSwap()
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

    function handleDepositComplete(txResults){
        if (txResults.recheckFailed) return

        if (txResults.recheck){
            if (!$swapInfo.depositHash){
                swapInfo.update(curr => {
                    curr.depositHash = txResults.txHash
                    curr.started = new Date()
                    return curr
                })
                saveSwap()
            }
            handleCheckAgain()
        }else{
            swapInfo.update(curr => {
                curr.depositHash = txResults.txHash
                curr.depositSuccess = true
                curr.started = new Date()
                return curr
            })
            saveSwap()
        }
    }

    function handleCheckAgain(){
        if ($swapInfo.depositHash != null && $swapInfo.depositHash.length === 64) {
            checkLamdenDepositTransaction($swapInfo.depositHash, depositTxStatus, handleDepositComplete)
        }else{
            depositTxStatus.set({errors:"Invalid deposit transaction hash."})
        }   
    }

    function handleInputDepositHash(){
        var depositHash = prompt("Please enter the tx hash of your successful deposit transaction.  This can be found by looking up your lamden wallet address at www.tauhq.com\n\nIf you haven't created a depoist transaction yet then click CANCEL and click the 'Create Depoist Transaction' button.", "");

        if (depositHash === null) return

        depositHash = depositHash.trim()

        if (depositHash.length === 64) {
            swapInfo.update(curr => {
                curr.depositHash = depositHash
                return curr
            })
            saveSwap()
            handleCheckAgain()
        }else{
            depositTxStatus.set({errors:"You entered an invalid deposit transaction hash."})
        }
        
    }

    function handleNextStep(){
        nextStep()
    }
</script>

<style>
    button{
        margin-left: 1em;
    }
    strong{
        margin-right: 1em;
    }

</style>

{#if current || complete}
    <div class="flex row align-center">
        <p class="text-warning"><strong>{depositComplete ? "Deposited" : "Depositing"}</strong></p>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($swapInfo.tokenAmount, 6)} ${$selectedToken.symbol}`}        
    </div> 

    <ul>
        <li class:yes={hasTokenApproval || depositComplete}>
            <span>
                {#if hasTokenApproval || depositComplete}
                    Deposit Approved
                {:else}
                    {#if skipApproval}
                        Approval Skipped
                    {:else}
                        Approval Needed
                    {/if}
                {/if}
            </span>
        </li>
        {#if depositComplete}
            <li class:yes={depositComplete}>
                <span>Tokens Deposited</span>
            </li>
        {/if}
    </ul>

    {#if !hasTokenApproval && !depositComplete}
        <Status statusStore={depositApprovalTxStatus} />
    {/if}

    {#if (hasTokenApproval || skipApproval) && !depositComplete}
        <Status statusStore={depositTxStatus} />
    {/if}

    {#if current || !complete}
        <div class="flex row just-end">
            {#if !hasTokenApproval && !depositComplete && !skipApproval}
                {#if !$depositApprovalTxStatus.loading}
                    <button on:click={handleApproveDeposit}>Approve Deposit</button>
                    <button class="secondary" on:click={handleSkipApprove}>Skip Approve Step</button>
                {/if}
                
            {/if}

            {#if hasTokenApproval || skipApproval}
                {#if !depositComplete}
                    {#if !$depositTxStatus.loading}
                        {#if $swapInfo.depositHash}
                            <button class="secondary" on:click={handleStartDeposit}>Create Another Deposit Transaction</button>
                        {:else}
                            <button class="success" on:click={handleStartDeposit}>Create Deposit Transaction</button>
                        {/if}
                    {/if}

                    {#if hasDepositHash }
                        <button on:click={handleCheckAgain}>Check Transaction Again</button>
                    {/if}
                    <button class="secondary" on:click={handleInputDepositHash}>Input Deposit Hash</button>

                {/if}
            {/if}

            {#if depositComplete}
                <button class="secondary" on:click={handleInputDepositHash}>Input Deposit Hash</button>
                <button class="success" on:click={handleNextStep}>Next Step</button>
            {/if}

        </div>
    {/if}
{/if}