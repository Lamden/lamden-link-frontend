<script>
    import { onMount, getContext } from 'svelte' 

    // Components
    import Status from './Status.svelte'

    // Misc
    import { waitForConfirmations } from '../../js/ethereum-utils.js'
    import { swapInfo } from '../../stores/globalStores.js';
    import { confirmationsStatus } from '../../stores/ethereumStores.js';

    let hasConfirmations;

    const { done } = getContext('process_swap')

    onMount(async () => {
        await waitForConfirmations(confirmationsStatus, $swapInfo.metamaskDeposit, 20)
        .then(res => {
            confirmationsStatus.set({})
            hasConfirmations = true
        })
        .catch(err => {
            console.log(err)
            confirmationsStatus.set({
                errors: [err]
            })
        })
    })

    function handleFinish(){
        done()
    }
</script>

<style>
    button{
        display: block;
        margin: 0 0 0 auto;
    }
</style>


<ul>
    <li class:yes={hasConfirmations}>
        <p><strong>Wait 20 Confirmations</strong></p>
    </li>
</ul>

{#if !hasConfirmations}
    <Status statusStore={confirmationsStatus}/>
{/if}


{#if hasConfirmations}
    <button class="success" on:click={handleFinish}>Finish Swap</button>
{/if}