<script>
    import { getContext } from 'svelte'

    // Components
    import ResultLink from '../ResultLink.svelte'
    import TokenApprovalInfo from './TokenApprovalInfo.svelte'
    import Status from './Status.svelte'

    // Misc
    import { sendEthChainApproval } from '../../js/ethereum-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { approvalTxStatus } from '../../stores/ethereumStores'
    import { getNetworkStore } from '../../stores/globalStores'
    import { swapInfo } from '../../stores/globalStores'

    export let current
    export let complete

    let networkInfo = getNetworkStore($swapInfo.from)

    $: hasPending = $swapInfo.metamaskApprovalPending || false
    $: hasApproval = $swapInfo.metamaskApproval || false

    const { nextStep } = getContext('process_swap')

    function handleApproveTx(){
        sendEthChainApproval(approvalTxStatus, handleApproveResult)
    }

    function handleNewApproveTx(){
        swapInfo.update(curr => {
            delete curr.metamaskApprovalPending
            return curr
        })
        sendEthChainApproval(approvalTxStatus, handleApproveResult)
    }

    function handleApproveResult(approveTxResult){
        if (approveTxResult.status){
            approvalTxStatus.set({loading: false})
            swapInfo.update(curr => {
                curr.metamaskApproval = JSON.parse(JSON.stringify(curr.metamaskApprovalPending))
                delete curr.metamaskApprovalPending
                return curr
            })
            saveSwap()
        }else{
            approvalTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
    }

    function handleNextStep(){
        nextStep()
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
    .button-margin{
        margin-left: 10px;
    }
</style>

{#if current || complete}
    <ul>
            <li class:yes={hasApproval}>
                {#if hasApproval}
                    <ResultLink title="Tokens successfully approved" network={$networkInfo} type="transaction" hash={$swapInfo.metamaskApproval}/>
                {:else}
                    {#if $approvalTxStatus.errors}
                        <ResultLink title="Transaction Failed" network={$networkInfo} type="transaction" hash={$swapInfo.metamaskApprovalPending}/>
                    {:else}
                        Need {$swapInfo.from === "ethereum" ? "ERC-20 " : "BEP-20 "} token approval
                    {/if}
                {/if}
            </li>
            
            {#if hasApproval}
                <li class="no-bullet">
                    <TokenApprovalInfo />
                </li>
            {/if}
    </ul>
    {#if !complete}
        {#if !hasApproval}
            <Status statusStore={approvalTxStatus} />
        {/if}

        {#if !$approvalTxStatus.loading}
            {#if !hasApproval && !hasPending}
                <button on:click={handleApproveTx} >Send Token Approval</button>
            {/if}

            {#if hasPending && !hasApproval}
                <div class="buttons flex row just-end">
                    <button on:click={handleApproveTx}>Check Again</button>
                    <button on:click={handleNewApproveTx} class="button-margin">Try New Approval</button>
                </div>
            {/if}

            {#if hasApproval}
                <button class="success" on:click={handleNextStep}>Next Step</button>
            {/if}
        {/if}
    {/if}
{/if}

