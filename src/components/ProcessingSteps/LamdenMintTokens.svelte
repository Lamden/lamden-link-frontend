<script>
    import { onMount, getContext } from 'svelte'

    // Components
    import Status from './Status.svelte'

    // Misc
    import { attemptToGetLamdenCurrentBlock, checkForLamdenEvents } from '../../js/lamden-utils'
    import { checkForEthereumConfirmations  } from '../../js/ethereum-utils'
    import { checkLamdenCurrentBlockStatus, checkLamdenEventStatus } from '../../stores/lamdenStores'
    import { checkEthConfirmationsStatus } from '../../stores/ethereumStores'
    import { swapInfo } from '../../stores/globalStores'
    import { saveSwap } from '../../js/localstorage-utils'

    const { done } = getContext('process_swap')
    let lamdenEventChecker = checkForLamdenEvents(checkLamdenEventStatus, done)

    onMount(() => {
        attemptToGetLamdenCurrentBlock(checkLamdenCurrentBlockStatus)
        .then((block) => {
            if (!$swapInfo.lastLamdenBlockNum){
                swapInfo.update(curr => {
                    curr.lastLamdenBlockNum = block
                    return curr
                })
                saveSwap()
            }
            if ($swapInfo.ethConfirmed) lamdenEventChecker.startChecking()
            else {
                checkForEthereumConfirmations(checkEthConfirmationsStatus, $swapInfo.depositEventBlock)
                .then(lamdenEventChecker.startChecking)
            }
        })
        .catch(err => console.log(err))
    })
</script>
{#if $swapInfo.ethConfirmed}
    {#if !$swapInfo.lastLamdenBlockNum}
        <Status statusStore={checkLamdenCurrentBlockStatus} />
    {:else}
        <Status statusStore={checkLamdenEventStatus} />
    {/if}
{:else}
    <Status statusStore={checkEthConfirmationsStatus} />
{/if}






