<script>
    import { onMount } from 'svelte'
    import { navigate } from "svelte-routing";

    // Components
    import NetworkLogo from '../components/MakeSwap/NetworkLogo.svelte'
    import TokenLogo from '../components/MakeSwap/TokenLogo.svelte'
    import ResultLink from '../components/ResultLink.svelte'

    //Misc
    import { swapInfo, getNetworkStore } from '../stores/globalStores'
    import { setLastSwap } from '../js/localstorage-utils'
    import { stringToFixed } from '../js/global-utils'

    let fromNetwork = null
    let toNetwork = null

    onMount(() => {
        setLastSwap()
        fromNetwork = getNetworkStore($swapInfo.from)
        toNetwork = getNetworkStore($swapInfo.to)
        console.log({swapInfo: $swapInfo})

    })

    function handleGoHome(){
        navigate("/", { replace: true });
    }


</script>

<style>
    .container{
        width: 100%;
        max-width: 650px;
    }
    .network-container{
        margin-top: 1rem;
    }
    h2{
        text-align: center;
    }

</style>


<div class="container">

    {#if fromNetwork && toNetwork}

        <h2>Thank you for using Lamden Link!</h2>
        <div class="flex row">
            <TokenLogo token={$swapInfo.token} clickable={false} />
        <p><strong>{`${stringToFixed($swapInfo.tokenAmount, 8)} ${$swapInfo.token.symbol}`}</strong> suuccessfully sent to the {$toNetwork.networkName}</p>
        </div>
        

        <div class="buttons flex row align-center just-center">
            <button on:click={handleGoHome}>Lamden Link Home</button>
        </div>

        <h3 class="text-primary-dim">Transaction Links</h3>

        <div class="flex row network-container">
            <NetworkLogo networkName={$swapInfo.from} />

            <div class="felx col">
                {#if $swapInfo.from !== 'lamden'}
                    <ResultLink title="MetaMask Account" network={$fromNetwork} type="address" hash={$swapInfo.metamask_address} />
                {:else}
                    <ResultLink title="Lamden Account"  network={$fromNetwork} type="address" hash={$swapInfo.lamden_address}/>
                {/if}
                
                {#if $swapInfo.burnApproveHash}
                    <ResultLink title="Burn Approval" network={$fromNetwork} type="transaction" hash={$swapInfo.burnApproveHash} />
                {/if}

                {#if $swapInfo.burnHash}
                    <ResultLink title="Burn Tokens" network={$fromNetwork} type="transaction" hash={$swapInfo.burnHash} />
                {/if}

                
            </div>
        </div>


        <div class="flex row network-container">
            <NetworkLogo networkName={$swapInfo.to} />

            <div class="felx col">     
                {#if $swapInfo.to !== 'lamden'}
                    <ResultLink title="MetaMask Address" network={$toNetwork} type="address" hash={$swapInfo.metamask_address} />
                {/if}       
            </div>
        </div>

    {/if}
</div>



