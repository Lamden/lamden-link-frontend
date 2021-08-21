<script>
    import { getContext } from 'svelte'
    import { fade } from 'svelte/transition';

    // Components
    import TokenLogo from './TokenLogo.svelte'
    import NetworkLogo from './NetworkLogo.svelte'

    // Icons
    import IconArrowRight from '../SVG/ArrowRightSVG.svelte'

    const { swapInfo, supportedTokens, setStep } = getContext('current_swap')

    function handleTokenSelected(e) {
        swapInfo.update(curr => {
            curr.token = e.detail
            return curr
        })
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
        console.log("CHOSING TOKEN")
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
    }

    .arrows{
        width: 30px;
    }
    .token{
        margin-left: -54px;
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
    <h2>Select a supported token</h2>
    <div class="flex row align-center just-center tokens">
        {#each supportedTokens() as token (token.address)}
            <div class="flex col align-center">
                <TokenLogo {token} on:selected={handleTokenSelected}/>
                <p class="token-name">{token.name}</p>
                <p class="token-symbol">{token.symbol}</p>
            </div>
        {/each}
    </div>

    <div class="flex row align-center">
        <div class="from-logo">
                <NetworkLogo networkName={$swapInfo.from}/>
        </div>

        <div class="token">
            <TokenLogo token={$swapInfo.token} clickable={false}/>
        </div>
        
        <div class="arrows">
            <IconArrowRight />
        </div>

        <div class="to-logo">
            <NetworkLogo networkName={$swapInfo.to}/>
        </div>
    </div>

    <div class="flex row">
        <button on:click={back}>Back</button>
        <button on:click={next} disabled={!$swapInfo.token}>Next</button>
    </div>
</div>

