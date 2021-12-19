<script>
    import { getContext, onMount } from 'svelte' 

    // Components
    import Status from './Status.svelte'

    // Misc
    import { continueDeposit } from '../../js/lamden-utils'
    import { sendProofToEthereum} from '../../js/ethereum-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { TWB_withdrawTxStatus } from '../../stores/ethereumStores'
    import { swapInfo } from '../../stores/globalStores';

    const { done, prevStep } = getContext('process_swap')

    export let current

    $: swapComplete = $swapInfo.complete || false
    $: hasPending = $swapInfo.withdrawHashPending || false

    onMount(() => {
        if ($swapInfo.withdrawHashPending) sendProof()
    })

    function withdrawTokens(){
        if ($swapInfo.proofData) sendProof()
        else continueDeposit(TWB_withdrawTxStatus, handleWithdrawResult)
    }

    function handleWithdrawResult(proofData){
        swapInfo.update(curr => {
            curr.proofData = proofData
            return curr
        })
        sendProof()        
    }

    async function sendProof(){
        sendProofToEthereum(TWB_withdrawTxStatus, handleSendProofResult)
    }

    async function handleSendProofResult(withdrawTxResult){
        if (withdrawTxResult.status){
            TWB_withdrawTxStatus.set({loading: false})
            swapInfo.update(curr => {
                curr.withdrawHash = JSON.parse(JSON.stringify(curr.withdrawHashPending))
                delete curr.withdrawHashPending
                curr.complete = true
                return curr
            })
            saveSwap()
            handleNextStep()
        }else{
            TWB_withdrawTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
    }   

    function handleNextStep(){
        done()
    }

    function handlePreviousStep(){
        prevStep()
    }

    function handleImDone(){
        let isDone = confirm("Only say OK if you have a completed a withdraw transaction outside of Lamden Link or have sped up a transaction in Metamask.\n\nAre you sure you have finished this swap?");
        if (isDone) handleNextStep()
    }

    function handleNewWithdraw(){
        let isSure = confirm("Only say OK if the previous transaction failed and Lamden Link was not made aware. Do NOT do this if you have pending transactions or transactions that you thinkg are taking too long. \n\n Are you sure you want to create a new withdraw transaction?");
        if (isSure) {
            swapInfo.update(curr => {
                delete curr.withdrawHashPending
                return curr
            })
            withdrawTokens()
        }
    }

</script>

<style>
    button{
        display: block;
        margin: 0 0 0 auto;
    }
    .buttons > button{
        margin-left: 1em;
    }
</style>

{#if current}
    <ul>
        {#if swapComplete}
            <li class:yes={swapComplete}>
                <span>
                    Token withdraw complete!
                </span>
            </li>
        {/if}
    </ul>

    {#if !swapComplete || hasPending}
        <Status statusStore={TWB_withdrawTxStatus} txHash={$swapInfo.depositHash} networkName={$swapInfo.to}/>
    {/if}
    <div class="flex row buttons just-end">
        {#if !$TWB_withdrawTxStatus.loading }
            {#if !swapComplete}
                <button class="success" on:click={withdrawTokens}>Withdraw Tokens</button>
                <button on:click={handlePreviousStep}>Previous Step</button>
            {/if}
            {#if swapComplete}
                <button class="success" on:click={handleNextStep}>Finsh</button>
            {/if}
        {/if}
        {#if hasPending && !swapComplete}
            <button class="secondary" on:click={handleNewWithdraw}>Create New Withdraw</button>
            <button class="secondary" on:click={handleImDone}>I'm done</button>
        {/if}
    </div>
{/if}