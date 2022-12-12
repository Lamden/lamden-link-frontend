<script>
    import { getContext } from 'svelte'
    import { get } from "svelte/store";

    // Components
    import SwapVisual from './SwapVisual.svelte'
    import TokenLogo from './TokenLogo.svelte'

    // Misc
    import { swapInfo, lamdenNetwork, getNetworkStore } from '../../stores/globalStores'
    import { saveSwap } from '../../js/localstorage-utils'

    const { supportedTokens, setStep, goHome } = getContext('current_swap')

    function handleTokenSelected(e) {
        swapInfo.update(curr => {
            let toNetwork = get(getNetworkStore(curr.to))

            curr.token = e.detail

            if (curr.token.lamden_equivalent){
                curr.mintedToken = $lamdenNetwork.tokens[curr.from].find(t => t.symbol === curr.token.lamden_equivalent)
            }else{
                if (curr.token.equivalents){
                    let equivalentTokens = curr.token.equivalents[curr.to]
 
                    if (equivalentTokens) curr.mintedToken = toNetwork.tokens[curr.from].find(t => t.symbol === equivalentTokens[0])
                }else{
                    curr.mintedToken = toNetwork.tokens[curr.from].find(t => t.symbol === curr.token.symbol)
                }
            }
            return curr
        })
    }

    function handleTokenClicked(token){
        handleTokenSelected({detail: token})
    }

    function back(){
        swapInfo.update(curr => {
            delete curr.from
            delete curr.to
            delete curr.token
            delete curr.mintedToken
            return curr
        })
        setStep(0)
    }

    function next(){
        swapInfo.update(curr => {
            curr.startDate = new Date()
            return curr
        })
        setStep(0)
        saveSwap()
        setStep(3)
    }

</script>

<style>
    h2{
        text-align: center;
    }
    .tokens{
        border: 2px solid var(--primary-color);
        background: var(--color-gray-5);
        width: fit-content;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        box-sizing: border-box;
    }
    .token{
        margin: 0 0px;
        padding: 1em;
        min-width: 100px;
        text-align: center;

    }
    .token:hover{
        background: rgba(255, 255, 255, 0.349);
        border-radius: 15px;
    }


    p{
        margin: 0;
    }
    p.token-name{
        margin: 0.5rem 0 0.25rem;
        width: max-content;
    }
    p.token-symbol{
        font-weight: bold;
        font-size: 0.8em;
        color: var(--font-primary-dim)
    }
    button{
        margin: 1rem 10px 0;
    }

    @media screen and (min-width: 430px) {

    }
</style>

<div class="flex col align-center just-center">
    <SwapVisual />

    <h2>Select a supported token</h2>
    <div class="flex row wrap align-center just-center tokens">
        {#each supportedTokens() as token (token.address)}
            {#if !token.one_way}
                <button class="not-button flex col align-center token" on:click={() => handleTokenClicked(token)}>
                    <TokenLogo {token} on:selected={handleTokenSelected}/>
                    <p class="token-name">{token.name}</p>
                    <p class="token-symbol">{token.symbol}</p>
                </button>
            {/if}
        {/each}
    </div>
    <div class="flex row">
        <button class="secondary" on:click={back}>Back</button>
        <button on:click={next} disabled={!$swapInfo.token}>Next</button>
    </div>
</div>

