<script>
    import { getContext } from 'svelte' 

    // Components
    import Status from './Status.svelte'

    // Misc
    import { continueBurn } from '../../js/lamden-utils'
    import { sendProofToEthereum } from '../../js/ethereum-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { withdrawTxStatus } from '../../stores/ethereumStores'
    import { swapInfo } from '../../stores/globalStores';

    const { done } = getContext('process_swap')

    export let current

    $: swapComplete = $swapInfo.complete || false

    function withdrawTokens(){
        if ($swapInfo.proofData) sendProof()
        else continueBurn(withdrawTxStatus, handleWithdrawResult)
    }

    function handleWithdrawResult(proofData){
        swapInfo.update(curr => {
            curr.proofData = proofData
            return curr
        })
        sendProof()        
    }

    async function sendProof(){
        sendProofToEthereum(withdrawTxStatus, handleSendProofResult)
    }

    async function handleSendProofResult(){
        swapInfo.update(curr => {
            curr.complete = true
            return curr
        })
        saveSwap()
    }   

    function handleNextStep(){
        done()
    }

</script>

<style>
    button{
        display: block;
        margin: 0 0 0 auto;
    }

</style>

{#if current}
    <ul>
        {#if swapComplete}
            <li class:yes={swapComplete}>
                Ethereum withdraw complete!
            </li>
        {/if}
    </ul>

    {#if !swapComplete}
        {#if withdrawTxStatus.loading }
            <Status statusStore={withdrawTxStatus} />
        {:else}
            <button on:click={withdrawTokens}>Withdraw Tokens</button>
        {/if}
    {/if }

    {#if swapComplete}
        <button on:click={handleNextStep}>Finsh</button>
    {/if }
{/if}