<script>
    import { getContext } from 'svelte'

    // Components
    import TokenLogo from '../MakeSwap/TokenLogo.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { selectedToken, swapInfo } from '../../stores/globalStores'
    import { burnTxStatus, burnApprovalTxStatus, lamdenTokenApprovalAmount, lamdenCurrencyBalance } from '../../stores/lamdenStores'
    import { stringToFixed } from '../../js/global-utils'
    import { sendBurnApproval, startBurn, checkLamdenBalance, checkLamdenBurnTransaction } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'

    export let current
    export let complete
    export const stepInfo = null;

    let skipApproval = false

    const { nextStep } = getContext('process_swap')

    $: hasTokenApproval = $lamdenTokenApprovalAmount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)
    $: burnComplete = $swapInfo.burnSuccess || false
    $: hasBurnHash = $swapInfo.burnHash || false

    function handleSkipApprove(){
        burnTxStatus.set({})
        skipApproval = true
    }

    function handleApproveBurn(){
        burnApprovalTxStatus.set({})
        burnTxStatus.set({})
        sendBurnApproval(burnApprovalTxStatus, handleApproveBurnComplete)
    }

    function handleStartBurn(){
        if ($swapInfo.burnHash){
            let agree = confirm("Lamden Link has detected that you already created a burn transaction for this swap.\nCreating a second burn transaction will almost always result in loss of funds.\n\nClick the OK button if your previous Burn Transaction failed and you would like to create a new one.\nClick CANCEL if you have a pending Burn Transaction.");
            if (!agree) return
        }

        startBurn(burnTxStatus, handleBurnComplete)
    }

    async function handleApproveBurnComplete(txResults){

        await new Promise((resolve) => {
            setTimeout(resolve, 10000)
        })
        lamdenTokenApprovalAmount.set($swapInfo.tokenAmount)
        burnApprovalTxStatus.set({})
        swapInfo.update(curr => {
            curr.burnApproveHash = txResults.txHash
            return curr
        })
        saveSwap()
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

    function handleBurnComplete(txResults){
        if (txResults.recheckFailed) return

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
            swapInfo.update(curr => {
                curr.burnHash = txResults.txHash
                curr.burnSuccess = true
                curr.started = new Date()
                return curr
            })
            burnTxStatus.set({})
            saveSwap()
            handleNextStep()
        }


    }

    function handleCheckAgain(){
        if ($swapInfo.burnHash != null && $swapInfo.burnHash.length === 64) {
            checkLamdenBurnTransaction($swapInfo.burnHash, burnTxStatus, handleBurnComplete)
        }else{
            burnTxStatus.set({errors:"Invalid burn transaction hash."})
        }
        
    }

    function handleInputBurnHash(){
        var burnHash = prompt("Please enter the tx hash of your successful burn transaction.  This can be found by looking up your lamden wallet address at www.tauhq.com\n\nIf you haven't created a Burn Transaction yet then click CANCEL and click 'Approve Burn' or 'Create Burn Transaction' button.", "");

        if (burnHash === null) return

        burnHash = burnHash.trim()

        if (burnHash.length === 64) {
            swapInfo.update(curr => {
                curr.burnHash = burnHash
                return curr
            })
            saveSwap()
            handleCheckAgain()
        }else{
            burnTxStatus.set({errors:"You entered an invalid burn transaction hash."})
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
        <p class="text-warning"><strong>{burnComplete ? "BURNT" : "BURNING"}</strong></p>
        <TokenLogo token={$selectedToken} clickable={false} size="tiny" />
        {`${stringToFixed($swapInfo.tokenAmount, 6)} ${$selectedToken.symbol}`}        
    </div>

    <ul>
        <li class:yes={hasTokenApproval || burnComplete}>
            <span>
                {#if hasTokenApproval || burnComplete}
                    Burn Approved
                {:else}
                    {#if skipApproval}
                        Approval Skipped
                    {:else}
                        Approval Needed
                    {/if}
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
    {/if}

    {#if (hasTokenApproval || skipApproval) && !burnComplete}
        <Status statusStore={burnTxStatus} />
    {/if}

    {#if current || !complete}
        <div class="flex row just-end">
            {#if !hasTokenApproval && !burnComplete && !skipApproval}
                {#if !$burnApprovalTxStatus.loading}
                    <button on:click={handleApproveBurn}>Approve Burn</button>
                    <button class="secondary" on:click={handleSkipApprove}>Skip Approve Step</button>
                {/if}
            {/if}

            {#if hasTokenApproval || skipApproval}
                {#if !burnComplete}
                    {#if !$burnTxStatus.loading}
                        {#if $swapInfo.burnHash}
                            <button class="secondary" on:click={handleStartBurn}>Create Another Burn Transaction</button>
                        {:else}
                            <button class="success" on:click={handleStartBurn}>Create Burn Transaction</button>
                        {/if}
                        
                    {/if}

                    {#if hasBurnHash }
                        <button on:click={handleCheckAgain}>Check Transaction Again</button>
                    {/if}

                    <button class="secondary" on:click={handleInputBurnHash}>Input Burn Hash</button>                
                {/if}
            {/if}
            {#if burnComplete}
                <button class="secondary" on:click={handleInputBurnHash}>Input Burn Hash</button>
                <button class="success" on:click={handleNextStep}>Next Step</button>
            {/if}
        </div>
    {/if}
{/if}