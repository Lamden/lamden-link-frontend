<script>
    import { navigate } from "svelte-routing";
    
    // Misc
    import { swapInfo } from '../stores/globalStores'
    import { clearCurrentSwap } from '../js/localstorage-utils';

    let copiedSwapInfo = false

    function handleStartOver(){
        clearCurrentSwap()
        setTimeout(handleGoHome, 500);
    }

    function handleCopyData(){
        copyToClipboard(JSON.stringify($swapInfo))
        copiedSwapInfo = true
        buttonTimer = setTimeout(() => copiedSwapInfo = false, 2000)
    }

    function handleGoHome(){
        navigate("/", { replace: true });
    }
</script>

<style>
    button.copyButton{
        transition: background-color 0.5s ease-in;
    }
    button.copied{
        background-color: var(--success-color-dark);
    }
    button{
        transition: all 1s ease-in;
        margin: 0 10px;
    }
    .start-over{
        max-width: 650px;
        margin: 0 auto;
        text-align: center;
        line-height: 1.5;
    }
    .start-over > p {
        font-weight: 100;
        font-size: 0.8em;
    }
    .start-over > div{
        margin-top: 2rem;
    }
    h2{
        text-align: center;
    }
    a{
        text-decoration: underline;
    }
</style>

<h2>Start Swap Over?</h2>
<div class="start-over text-center">
    <p>Restarting the swap will clear any swap data gathered so far such as amounts and successful transaction hashes.</p>
    <p>Be sure to copy the current swap info for your records BEFORE starting the swap.</p>

    <p class="text-warning">
        Do NOT do this if you have already burned your tokens!  
        If you have already sent the Lamden Burn transaction then 
        <a href="https://t.me/lamdenlinksupport" target="_blank" rel="noopener noreferrer"> contact Lamden Link Support </a>
    </p>

    <div class="flex just-center">
        <button class="warning" on:click={handleStartOver}>Start Swap Over</button>
        <button class="copyButton" on:click={handleCopyData} class:copied={copiedSwapInfo}>Copy Swap Info</button>
        <button on:click={handleGoHome}>Home</button>
    </div>
</div>