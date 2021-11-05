<script>
    import { getContext } from 'svelte'

    // Components
    import MetaMaskBalance from '../ProcessingSteps/MetaMaskBalance.svelte'
    import MetaMaskTokenInput from '../ProcessingSteps/MetamaskTokenInput.svelte'
    import TokenApprovalInfo from '../ProcessingSteps/TokenApprovalInfo.svelte'

    // Misc
    import BN from 'bignumber.js'
    import { ethStore, connected, selectedAccount, chainData } from 'svelte-web3'
    import { ethChainBalance, ethChainTokenBalance } from '../../stores/ethereumStores'
    import { getNetworkStore, swapInfo } from '../../stores/globalStores';
    import { checkChain, checkChainBalance, checkChainTokenBalance } from '../../js/ethereum-utils';   

    export let current
    export let complete
    export let stepInfo

    let metamaskError = false
    let networkInfo = getNetworkStore(stepInfo.network)

    $: hasEthBalnnce = $ethChainBalance.isGreaterThan(0)
    $: isCorrectChain = checkChain($chainData)
    $: tokenFromMe = $swapInfo.from !== "lamden"
    $: tokensToSend = $swapInfo.tokenAmount || new BN(0)
    $: hasEnoughTokens = tokensToSend.isGreaterThan(0) && $ethChainTokenBalance.isGreaterThanOrEqualTo(tokensToSend)
    $: hasApproval = $swapInfo.metamaskApproval || false

    const { nextStep, setStep, restart } = getContext('process_swap')

    chainData.subscribe(() => {
        if (complete){
            if (!checkChain()){
                if ($swapInfo.from === "lamden") setStep(1)
                else setStep(0)
            }else{
                if ($connected && $selectedAccount) refreshAllBalances()
            }
        }
    });

    selectedAccount.subscribe(refreshAllBalances)

    async function connectMetamask() {
        try {
            await ethStore.setBrowserProvider()
        } catch (error) {
            if (error.code === -32002) {
                metamaskError = 'Please open metamask and accept the connection request.'
            } else if (error.code === 4001) {
                metamaskError = 'Request Rejected.'
            } else {
                metamaskError = 'Something went wrong.'
            }
        }
    }

    function handleNextStep(){
        swapInfo.update(curr => {
            curr.metamask_address = $selectedAccount
            return curr
        })
        nextStep()
    }

    function refreshAllBalances(){
        checkChainBalance()
        checkChainTokenBalance()
    }

    function handleStartOver(){
        startOver()
    }

</script>


<style>
    ul{
        margin: 0;
    }

    button{
        display: block;
        margin: 1rem 0 0 auto;
    }
    .buttons > button{
        margin: 0;
        margin-top: 1rem;
        margin-left: 10px;
    }

    @media screen and (min-width: 430px) {

    }
</style>

<ul>
    <li class:yes={$connected && !metamaskError}>
        {#if !$connected}
            {#if metamaskError}
                {metamaskError}.
            {:else}
                Not Connected
            {/if}
        {:else}
            Installed and Connected
        {/if}
    </li>
    {#if $connected && (current || complete)}
        <li class:yes={isCorrectChain}>
            {#if isCorrectChain}
                Connected to {$networkInfo.networkName}
            {:else}
                Switch Metamask to {$networkInfo.networkName}
            {/if}
        </li>
    {/if}
    {#if $connected && isCorrectChain && (current || complete)}
        <li class:yes={hasEthBalnnce}>
            {#if !hasEthBalnnce}
                {`No ${$networkInfo.network_symbol} balance.`}
            {:else}
                {`${$networkInfo.network_symbol} balance greater than zero.`}
            {/if}
        </li>
    {/if}

    {#if isCorrectChain && $selectedAccount}
        <li class="no-bullet">
            <MetaMaskBalance {stepInfo}/>
        </li>
    {/if}

    {#if isCorrectChain && $connected && tokenFromMe}
        <li class="no-bullet">
            <MetaMaskTokenInput {stepInfo} input={!hasApproval} {complete}/>
        </li>
    {/if}

    {#if $connected && hasApproval && tokenFromMe}
        <li class="no-bullet">
            <TokenApprovalInfo />
        </li>
    {/if}
</ul>



{#if current}
    {#if $connected && $selectedAccount}
        {#if isCorrectChain}
            {#if tokenFromMe}
                <div class="flex row just-end buttons">
                    {#if hasApproval}
                        <button on:click={restart}>Start Over</button>
                        <button class:success={hasEthBalnnce && hasEnoughTokens } disabled={!hasEthBalnnce} on:click={handleNextStep}>
                            Resume Swap
                        </button>
                    {:else}
                        <button class:success={hasEthBalnnce && hasEnoughTokens } disabled={!hasEthBalnnce || !hasEnoughTokens} on:click={handleNextStep}>
                            Next Step
                        </button>
                    {/if}
                </div>
            {:else}
                <button class="success" disabled={!hasEthBalnnce} on:click={handleNextStep}>Next Step</button>
            {/if}
        {/if}
    {:else}
        <button on:click={connectMetamask}>Connect To MetaMask</button>
    {/if}
{/if}