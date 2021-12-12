<script>
    import { onMount, getContext } from 'svelte'

    // Components
    import Status from './Status.svelte'

    // Misc
    import { checkForLamdenEvents } from '../../js/lamden-utils'
    import { checkForEthereumConfirmations  } from '../../js/ethereum-utils'
    import { checkLamdenEventStatus } from '../../stores/lamdenStores'
    import { checkEthConfirmationsStatus } from '../../stores/ethereumStores'
    import { swapInfo } from '../../stores/globalStores'

    const { done } = getContext('process_swap')
    let lamdenEventChecker = checkForLamdenEvents(checkLamdenEventStatus, done)

    onMount(() => {
        if ($swapInfo.ethConfirmed) lamdenEventChecker.startChecking()
        else {
            checkForEthereumConfirmations(checkEthConfirmationsStatus, $swapInfo.depositEventBlock)
            .then(lamdenEventChecker.startChecking)
        }
    })
</script>
{#if $swapInfo.ethConfirmed}
    <Status statusStore={checkLamdenEventStatus} />
{:else}
    <Status statusStore={checkEthConfirmationsStatus} />
{/if}






