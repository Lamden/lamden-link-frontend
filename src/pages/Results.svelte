<script>
    import { onMount } from 'svelte'
    import { navigate } from "svelte-routing";

    // Components
    import NetworkLogo from '../components/MakeSwap/NetworkLogo.svelte'
    import TokenLogo from '../components/MakeSwap/TokenLogo.svelte'
    import ResultLink from '../components/ResultLink.svelte'

    //Misc
    import { swapInfo, getNetworkStore, lastSwap } from '../stores/globalStores'
    import { setLastSwap } from '../js/localstorage-utils'
    import { stringToFixed } from '../js/global-utils'

    let fromNetwork = null
    let toNetwork = null

    onMount(() => {
        console.log({lastSwap: $lastSwap})
        if (!$lastSwap) return
        if (!$lastSwap.complete) return

        console.log("?")
        fromNetwork = getNetworkStore($lastSwap.from)
        toNetwork = getNetworkStore($lastSwap.to)
        console.log({lastSwap: $lastSwap})
    })

    function handleGoHome(){
        navigate("/", { replace: true });
    }


</script>

<style>
    .container{
        width: 100%;
    }
    .network-container{
        margin: 1rem 2rem;
        width: max-content;
    }
    h2{
        margin: 1rem 0 2rem;
    }
    hr {
        margin: 1rem 0 2rem;
        background-color: var(--primary-color);
        border-style: none;
        height: 1px;
    }

</style>


<div class="container">
    {#if !$lastSwap}
        <h2>There is no previous swap data</h2>
        <div class="buttons flex row align-center just-center">
            <button on:click={handleGoHome}>Lamden Link Home</button>
        </div>
    {/if}

    {#if fromNetwork && toNetwork}

        <h2>Thank you for using Lamden Link!</h2>
        <hr>
        <div class="flex row">
            <TokenLogo token={$lastSwap.token} clickable={false} />
        <p><strong>{`${stringToFixed($lastSwap.tokenAmount, 8)} ${$lastSwap.token.symbol}`}</strong> suuccessfully sent to the {$toNetwork.networkName}</p>
        </div>
        
        

        <div class="buttons flex row align-center just-center">
            <button on:click={handleGoHome}>Lamden Link Home</button>
        </div>

        <hr>
        <h3 class="text-primary-dim">Transaction Links</h3>

        <div class="flex row wrap align-center just-around">
            <div class="flex row network-container">
                <NetworkLogo networkName={$lastSwap.from} />

                <div class="felx col">
                    {#if $lastSwap.from !== 'lamden'}
                        <ResultLink title="MetaMask Address" network={$fromNetwork} type="address" hash={$lastSwap.metamask_address} />
                    {:else}
                        <ResultLink title="Lamden Account"  network={$fromNetwork} type="address" hash={$lastSwap.lamden_address}/>
                    {/if}
                    
                    {#if $lastSwap.burnApproveHash}
                        <ResultLink title="Burn Approval" network={$fromNetwork} type="transaction" hash={$lastSwap.burnApproveHash} />
                    {/if}

                    {#if $lastSwap.burnHash}
                        <ResultLink title="Burn Tokens" network={$fromNetwork} type="transaction" hash={$lastSwap.burnHash} />
                    {/if}


                    {#if $lastSwap.metamaskApproval}
                        <ResultLink title="Approve Tokens" network={$fromNetwork} type="transaction" hash={$lastSwap.metamaskApproval} />
                    {/if}

                    {#if $lastSwap.metamaskDeposit}
                        <ResultLink title="Deposit Tokens" network={$fromNetwork} type="transaction" hash={$lastSwap.metamaskDeposit} />
                    {/if}

                </div>
            </div>


            <div class="flex row network-container">
                <NetworkLogo networkName={$lastSwap.to} />

                <div class="felx col">     
                    {#if $lastSwap.to !== 'lamden'}
                        <ResultLink title="MetaMask Address" network={$toNetwork} type="address" hash={$lastSwap.metamask_address} />
                    {:else}
                        <ResultLink title="Lamden Address" network={$toNetwork} type="address" hash={$lastSwap.lamden_address} />
                    {/if}       
                </div>
            </div>
    </div>
    {/if}
</div>



