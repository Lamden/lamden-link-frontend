<script>
    import { getContext } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { burnTxStatus, burnApprovalTxStatus, lamdenTokenApprovalAmount, lamdenCurrencyBalance } from '../../stores/lamdenStores'
    import { stringToFixed } from '../../js/global-utils'
    import { checkLamdenTokenApproval, sendBurnApproval, startBurn, checkLamdenBalance, checkLamdenTransaction } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'

    export let current
    export let complete
    export let stepInfo = null;

    const { nextStep } = getContext('process_swap')

    let recheckFailed = false

    $: hasTokenApproval = $lamdenTokenApprovalAmount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)
    $: burnComplete = $swapInfo.burnSuccess || false

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
        txResults = {txHash: txResults.txHash, recheck: true}
        
        if (txResults.recheckFailed) {
            recheckFailed = true
            return
        }
        if (txResults.recheck){
            if (!$swapInfo.burnHash){
                swapInfo.update(curr => {
                    curr.burnHash = txResults.txHash
                    curr.started = new Date()
                    return curr
                })
                saveSwap()
            }
            handleCheckAgain()
        }else{
            recheckFailed = false
            swapInfo.update(curr => {
                curr.burnHash = txResults.txHash
                curr.burnSuccess = true
                curr.started = new Date()
                return curr
            })
            saveSwap()
        }


    }
    function handleCheckAgain(){
        checkLamdenTransaction($swapInfo.burnHash, burnApprovalTxStatus, handleBurnComplete)
    }
    function handleInputBurnHash(){
        var burnHash = prompt("Please enter the tx hash of your successful burn transaction.  This can be found by looking up your lamden wallet address at www.tauhq.com", "");

        burnHash = burnHash.trim()

        if (burnHash != null && burnHash.length === 64) {
            swapInfo.update(curr => {
                curr.burnHash = txResults.txHash
                return curr
            })
            saveSwap()
        }
        handleCheckAgain()
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
    <div class="flex row align-center">
        <p class="text-warning"><strong>{burnComplete ? "BURNT" : "BURNING"}</strong></p>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($swapInfo.tokenAmount, 8)} ${$selectedToken.symbol}`}        
    </div> 
    <ul>
        <li class:yes={hasTokenApproval || burnComplete}>
            <span>
                {#if hasTokenApproval || burnComplete}
                    Burn Approved
                {:else}
                    Approval Needed
                {/if}
            </span>
        </li>
        {#if burnComplete}
            <li class:yes={burnComplete}>
                <span>
                    Tokens Burned
                </span>
            </li>
        {/if}
    </ul>


    {#if !hasTokenApproval && !burnComplete}
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

    {#if recheckFailed}
        <button on:click={handleCheckAgain}>Check Again</button>
        <button on:click={handleInputBurnHash}>Input Burn Hash</button>
    {/if}
    

{/if}