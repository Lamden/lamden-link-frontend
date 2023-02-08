<script>
    import { getContext, onMount } from 'svelte'

    // Components
    import ResultLink from '../ResultLink.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { sendEthChainDeposit, attemptToGetCurrentBlock, checkForEthereumEvents } from '../../js/ethereum-utils'
    import { attemptToGetLamdenCurrentBlock } from '../../js/lamden-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { depositTxStatus, currentBlockStatus, checkEthEverntsStatus } from '../../stores/ethereumStores'
    import { getNetworkStore, tabHidden } from '../../stores/globalStores'
    import { checkLamdenCurrentBlockStatus } from '../../stores/lamdenStores'
    import { swapInfo } from '../../stores/globalStores'

    export let current
    export let complete

    let networkInfo = getNetworkStore($swapInfo.from)
    let clicked = false
    
    $: isComplete = $swapInfo.metamaskDeposit || false

    const { nextStep } = getContext('process_swap')
    let ethereumEventChecker = checkForEthereumEvents(checkEthEverntsStatus, handleNextStep)

    tabHidden.subscribe((curr) => {
        if (curr) ethereumEventChecker.stopChecking()
        else {
            if (ethereumEventChecker.stopped()) ethereumEventChecker.startChecking()
        }
    })

    onMount(getBlockNum)

    function getBlockNum(){
        attemptToGetCurrentBlock(currentBlockStatus)
        .then((block) => {
            if (!$swapInfo.lastETHBlockNum){
                swapInfo.update(curr => {
                    curr.lastETHBlockNum = block
                    return curr
                })
                saveSwap()
            }
            if (ethereumEventChecker.stopped()) ethereumEventChecker.startChecking()
        })
        .catch(err => console.log(err))

        if (!$swapInfo.lastLamdenBlockNum){
            attemptToGetLamdenCurrentBlock(checkLamdenCurrentBlockStatus)
            .then((block) => {

                swapInfo.update(curr => {
                    curr.lastLamdenBlockNum = block
                    return curr
                })
                saveSwap()
            })
            .catch(err => console.log(err))
        }
    }


    function handleDepositTx(){
        depositTxStatus.set({})
        clicked = true
        sendEthChainDeposit(depositTxStatus, handleDepositResult)
    }


    function handleDepositResult(depositTxResult){
        if (depositTxResult.status){
            depositTxStatus.set({loading: false})
        }else{
            depositTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
    }

    function handleGetBlockNum(){
        getBlockNum()
    }

    function handleNextStep(){
        ethereumEventChecker.stopChecking()
        nextStep()
    }

    function handleNewDepositTx(){
        let agree = confirm("WARNING\n\nYou should only ever have 1 deposit transaction pending. Only select OK if your previous tx failed and Lamden Link did not pick up the failure.\n\nDo not use this if your transaction is taking too long because of a slow network or low gas used (for slow transactions use the SPEED UP function in metamask).\n\nSelect CANCEL if you already have a pending Depost transaction.")
        if (agree) handleDepositTx()
    }


</script>

<style>

    button{
        display: block;
        margin: 0 0 0 auto;
    }
</style>

{#if current || complete}
    {#if !$swapInfo.lastETHBlockNum}
        <Status statusStore={currentBlockStatus} />
        {#if $currentBlockStatus.errors}
            <button on:click={handleGetBlockNum} > Try Again </button>
        {/if}
    {:else}
        <ul>
            {#if isComplete}
                <li class:yes={isComplete}>
                    <span>
                        <ResultLink title="Tokens successfully deposited" network={$networkInfo} type="transaction" hash={$swapInfo.metamaskDeposit}/>
                    </span>
                </li>
            {/if}
        </ul>

        {#if !isComplete}
            <Status statusStore={checkEthEverntsStatus} />
            {#if clicked}
                <button class="secondary" on:click={handleNewDepositTx}>Create Another Deposit Tx</button>
            {:else}
                <button class="success" on:click={handleDepositTx}>Create Deposit Transaction</button>
            {/if}
        {/if}
    {/if}
{/if}

