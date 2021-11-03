<script>
    import { getContext } from 'svelte'

    // Components
    import ResultLink from '../ResultLink.svelte'
    import Status from '../ProcessingSteps/Status.svelte'

    // Misc
    import { sendEthChainDeposit } from '../../js/ethereum-utils'
    import { saveSwap } from '../../js/localstorage-utils'
    import { depositTxStatus } from '../../stores/ethereumStores'
    import { getNetworkStore } from '../../stores/globalStores'
    import { swapInfo } from '../../stores/globalStores'

    export let current
    export let complete

    let networkInfo = getNetworkStore($swapInfo.from)

    $: hasPending = $swapInfo.metamaskDepositPending || false
    $: isComplete = $swapInfo.complete || false

    const { done, nextStep } = getContext('process_swap')

    function handleDepositTx(){
        sendEthChainDeposit(depositTxStatus, handleDepositResult)
    }

    function handleNewDepositTx(){
        swapInfo.update(curr => {
            delete curr.metamaskDepositPending
            return curr
        })
        sendEthChainDeposit(depositTxStatus, handleDepositResult)
    }

    function handleDepositResult(depositTxResult){
        if (depositTxResult.status){
            depositTxStatus.set({loading: false})
            swapInfo.update(curr => {
                curr.metamaskDeposit = JSON.parse(JSON.stringify(curr.metamaskDepositPending))
                delete curr.metamaskDepositPending
                curr.complete = true
                return curr
            })
            saveSwap()
        }else{
            depositTxStatus.set({errors: ['Transactoin Failed. Check blockexplorer for details.']})
        }
    }

    function handleFinish(){
        done()
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
        {#if hasPending || isComplete}
            {#if isComplete}
                <li class:yes={isComplete}>
                    <ResultLink title="Tokens successfully deposited" network={$networkInfo} type="transaction" hash={$swapInfo.metamaskDeposit}/>
                </li>
            {:else}
                {#if $depositTxStatus.errors}
                    <li class:yes={isComplete}>
                        <ResultLink title="Transaction Failed" network={$networkInfo} type="transaction" hash={$swapInfo.metamaskDepositPending}/>
                    </li>
                {/if}
            {/if}
        {/if}
    </ul>

    {#if !isComplete}
        <Status statusStore={depositTxStatus} />
    {/if}

    {#if !$depositTxStatus.loading}
        {#if !isComplete && !hasPending}
            <button on:click={handleDepositTx} >Deposit Tokens</button>
        {/if}

        {#if hasPending && !isComplete}
            <div class="buttons flex row just-end">
                <button on:click={handleDepositTx}>Check Again</button>
                <button on:click={handleNewDepositTx} class="button-margin">Try Deposit Again</button>
            </div>
        {/if}

        {#if isComplete}
            {#if $swapInfo.from === 'binance'}
                <button class="success" on:click={handleFinish}>Finish</button>
            {:else}
                <button class="success" on:click={nextStep}>Next Step</button>
            {/if}
        {/if}
    {/if}
{/if}

