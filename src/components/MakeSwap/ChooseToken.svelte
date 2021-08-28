<script>
    import { getContext } from 'svelte'

    // Components
    import SwapVisual from './SwapVisual.svelte'
    import TokenLogo from './TokenLogo.svelte'

    // Misc
    import { swapInfo } from '../../stores/globalStores'
    import { saveSwap } from '../../js/localstorage-utils'

    const { supportedTokens, setStep, goHome } = getContext('current_swap')

    function handleTokenSelected(e) {
        swapInfo.update(curr => {
            curr.token = e.detail
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
            return curr
        })
        setStep(0)
    }

    function next(){
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
        width: 100%;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        box-sizing: border-box;
    }
    .token{
        margin: 0 0px;
        padding: 10px;

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
    }
    p.token-symbol{
        font-weight: bold;
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

    <div class="flex row">
        <button on:click={back}>Back</button>
        <button on:click={next} disabled={!$swapInfo.token}>Next</button>
        <button class="secondary" on:click={goHome}>Home</button>
    </div>

    <h2>Select a supported token</h2>
    <div class="flex row align-center just-center tokens">
        {#each supportedTokens() as token (token.address)}
            <div class="flex col align-center token" on:click={() => handleTokenClicked(token)}>
                <TokenLogo {token} on:selected={handleTokenSelected}/>
                <p class="token-name">{token.name}</p>
                <p class="token-symbol">{token.symbol}</p>
            </div>
        {/each}
    </div>
</div>

