<script>
    import { navigate } from "svelte-routing";

    // Components
    import NetworkLogo from '../components/MakeSwap/NetworkLogo.svelte'
    import TokenLogo from '../components/MakeSwap/TokenLogo.svelte'
    import ResultLink from '../components/ResultLink.svelte'

    //Misc
    import { lastSwap } from '../stores/globalStores'
    import { stringToFixed } from '../js/global-utils'

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
        margin: 2rem 0;
    }
    .date{
        font-size: 0.8em;
        margin: -1rem 0 0 5em;
    }
    hr {
        margin: 1rem 0 2rem;
        background-color: var(--primary-color);
        border-style: none;
        height: 1px;
    }
    .add-token-link{
        text-align: center;
        display: block;
        margin: 2rem 0 0;
    }
    a:hover{
        color: var(--color-white);
        text-decoration: underline;
    }

</style>


<div class="container">
    {#if !$lastSwap}
        <h2>There is no previous swap data</h2>
        <div class="buttons flex row align-center just-center">
            <button on:click={handleGoHome}>Lamden Link Home</button>
        </div>
    {/if}

    {#if $lastSwap}
        <h2>Thank you for using Lamden Link!</h2>
        <hr>
        <div class="flex row">
            <TokenLogo token={$lastSwap.token} clickable={false} />
            <p>
                <strong>{`${stringToFixed($lastSwap.tokenAmount, 6)} ${$lastSwap.token.symbol}`}</strong> successfully sent to the {$lastSwap.toNetwork.networkName}
            </p>
        </div>
        <p class="date text-primary-dim">sent on {new Date($lastSwap.completeDate).toLocaleString()}</p>

        <a class="add-token-link" href="https://youtu.be/Bv_RT0-j8zw" target="_blank" rel="noopener noreferrer">Learn to add tokens to the Lamden Wallet</a>


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
                        <ResultLink title={`MetaMask: ${$lastSwap.metamask_address}`} network={$lastSwap.fromNetwork} type="address" hash={$lastSwap.metamask_address} />
                    {:else}
                        <ResultLink title="Lamden Account"  network={$lastSwap.fromNetwork} type="address" hash={$lastSwap.lamden_address}/>
                    {/if}
                    
                    {#if $lastSwap.burnApproveHash}
                        <ResultLink title="Burn Approval" network={$lastSwap.fromNetwork} type="transaction" hash={$lastSwap.burnApproveHash} />
                    {/if}

                    {#if $lastSwap.burnHash}
                        <ResultLink title="Burn Tokens" network={$lastSwap.fromNetwork} type="transaction" hash={$lastSwap.burnHash} />
                    {/if}


                    {#if $lastSwap.metamaskApproval}
                        <ResultLink title="Approve Tokens" network={$lastSwap.fromNetwork} type="transaction" hash={$lastSwap.metamaskApproval} />
                    {/if}

                    {#if $lastSwap.metamaskDeposit}
                        <ResultLink title="Deposit Tokens" network={$lastSwap.fromNetwork} type="transaction" hash={$lastSwap.metamaskDeposit} />
                    {/if}

                </div>
            </div>


            <div class="flex row network-container">
                <NetworkLogo networkName={$lastSwap.to} />

                <div class="felx col">     
                    {#if $lastSwap.to !== 'lamden'}
                        <ResultLink title="MetaMask Address" network={$lastSwap.toNetwork} type="address" hash={$lastSwap.metamask_address} />
                    {:else}
                        <ResultLink title={`Wallet: ${$lastSwap.lamden_address}`} network={$lastSwap.toNetwork} type="address" hash={$lastSwap.lamden_address} />
                    {/if}       
                </div>
            </div>
        </div>
    {/if}
</div>



