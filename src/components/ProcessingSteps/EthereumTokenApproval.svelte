<script>
    import { getContext, onDestroy, onMount, tick } from 'svelte'
    import { Diamonds } from 'svelte-loading-spinners'

    // Components
    import ResultLink from '../ResultLink.svelte'
    import TokenApprovalInfo from './TokenApprovalInfo.svelte'
    import Status from './Status.svelte'

    // Misc
    import { sendEthChainApproval, checkTokenAllowance } from '../../js/ethereum-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { approvalTxStatus, ethChainTokenAllowance } from '../../stores/ethereumStores'
    import { getNetworkStore, tabHidden } from '../../stores/globalStores'
    import { swapInfo } from '../../stores/globalStores'

    export let current
    export let complete

    let timer = null
    let checking = false
    let skipped = false

    let clicked = false

    $: needsApproval = $swapInfo.tokenAmount.isGreaterThan($ethChainTokenAllowance)
  
    const { nextStep } = getContext('process_swap')

    tabHidden.subscribe((curr) => {
        if (!current || complete) {
            stopCheckingForAllowance()
            return
        }
        if (curr) stopCheckingForAllowance()
        else {
            if (timer) return
            loopAllowanceCheck()
        }
    })

    onMount(() => {

        checkAllowance()
        // loopAllowanceCheck()

        return stopCheckingForAllowance
    })

    function loopAllowanceCheck(){
        if ($tabHidden) return
        clearInterval(timer)
        timer = setInterval(checkAllowance, 5000)
    }

    function checkAllowance(){
        if ($tabHidden || checking) return
        checking = true

        checkTokenAllowance().then(async (amount) => {

            if (amount.isGreaterThanOrEqualTo($swapInfo.tokenAmount)) handleNextStep()
            checking = false
        })
    }

    function handleApproveTx(){
        approvalTxStatus.set({})
        if (!needsApproval) return
        clicked = true
        sendEthChainApproval(approvalTxStatus, handleApproveResult)
    }

    function handleApproveResult(approveTxResult){
        if (!approveTxResult.status){
            approvalTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
    }

    function handleCancelTx(){
        swapInfo.update(curr => {
            delete curr.metamaskApprovalPending
            return curr
        })
        approvalTxStatus.set({})
    }

    function stopCheckingForAllowance(){
        clearInterval(timer)
        timer = null
    }

    function handleNextStep(){
        stopCheckingForAllowance()
        approvalTxStatus.set({})
        nextStep()
    }

    function handleNewTx(){
        let agree = confirm("Only create a new approval transaction if the previous one failed and Lamden Link did not pick it up.\n\nIf you have already submitted a transaction and it's taking a long time then use the SPEED UP function in metamask.\n\nHit CANCEL if you already have a pending transaction.");
        if (agree) {
            handleCancelTx()
            handleApproveTx()
        }
    }

    function handleSkip(){
        let agree = confirm("Only select OK if you have a completed approval transaction that Lamden Link did not pickup.\n\nIf you do not have an approval then skipping this step will cause the next step to fail 100% of the time. You are not saving money by skipping the approval; it is mandatory.\n\nHit CANCEL if you don't have a successful approval transaction.");
        if (agree) {
            skipped = true
            handleNextStep()
        }
    }
</script>

<style>

    button{
        display: block;
        margin: 0 0 0 auto;
    }
    .buttons > button{
        margin: 0;
        margin-left: 10px;
    }
    ul.skipped{
        margin-bottom: 4em;
    }
</style>

{#if current || complete}
    <ul class:skipped={skipped}>
        {#if !skipped}
            <li class:yes={!needsApproval}>
                <span>
                    {#if needsApproval}
                        Need {$swapInfo.from === "ethereum" ? "ERC-20 " : "BEP-20 "} token approval.
                    {:else}
                        Tokens successfully approved
                    {/if}
                </span>
            </li>
            <!--
            {#if needsApproval}
                <li class="none ">
                    <div class="flex row align-center check-allowance">
                        <span class="check-allowance-text">{`Current allowance ${$ethChainTokenAllowance.toString()} ${$swapInfo.token.symbol}`}</span>
                        <Diamonds size="3" unit="em" color="white" duration="2.5s"/>
                    </div>
                </li>
            {/if}
            -->
        {/if}
    </ul>
    
    {#if !complete}
        <Status statusStore={approvalTxStatus} />

        <div class="flex row just-end buttons">
            {#if needsApproval}
                <button class:secondary={clicked} class:success={!clicked} on:click={clicked ? handleNewTx : handleApproveTx }>{clicked ? "Create Another Approval Tx" : "Create Approval Tx"}</button>
            {/if}
            {#if !needsApproval}
                <button class="success" on:click={handleNextStep}>Next Step</button>
            {/if}
            {#if $swapInfo.lastETHBlockNum}
                <button class="secondary" on:click={handleSkip}>Skip Step</button>
            {/if}
        </div>
    {/if}
{/if}
