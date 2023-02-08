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

    let clicked = false

    $: swapComplete = $swapInfo.complete || false

    function withdrawTokens(){
        withdrawTxStatus.set({})
        clicked = true
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

    async function handleSendProofResult(withdrawTxResult){
        if (withdrawTxResult.status){
            withdrawTxStatus.set({loading: false})
            swapInfo.update(curr => {
                curr.withdrawHash = JSON.parse(JSON.stringify(curr.withdrawHashPending))
                delete curr.withdrawHashPending
                curr.complete = true
                return curr
            })
            saveSwap()
            done()
        }else{
            withdrawTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
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
                <span>
                    Token withdraw complete!
                </span>
            </li>
        {/if}
    </ul>

    {#if !swapComplete}
        <Status statusStore={withdrawTxStatus} />
    {/if}

    {#if !$withdrawTxStatus.loading }
        {#if !swapComplete}
                <button on:click={withdrawTokens}>{clicked ? "Try Again" : "Withdraw Tokens"}</button>
        {/if }

        {#if swapComplete}
            <button class="success" on:click={handleNextStep}>Finsh</button>
        {/if }
    {/if}
{/if}