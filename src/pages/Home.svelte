<script>
	import { onMount } from 'svelte'
	import { navigate } from "svelte-routing";

	// Components
	import BigButton from '../components/BigHomeButton.svelte'

	// MISC
	import { lastSwap, swapInfo } from '../stores/globalStores'
	import { clearCurrentSwap } from '../js/localstorage-utils'
	import { openURL } from '../js/global-utils'

	$: hasLastSwap = !$lastSwap ? false : true
	$: hasPendingSwap = Object.keys($swapInfo).length > 0 ? true : false

	function handleStartNew(){
		clearCurrentSwap()
		navigate("/swap", { replace: true });
	}

	function handleResume(){
		navigate("/swap", { replace: true });
	}
	
	function handleViewLast(){
		navigate("/results", { replace: true });
	}

    function handleOpenSuport(){
        openURL("https://t.me/lamdenlinksupport")
    }

</script>

<style>
	.buttons{
		width: max-content;
		margin: 2rem auto 1rem;
	}
	.subtitle{
		font-size: 1em;
	}
	p{
		margin: 0.5rem 0.5em 0 0;
		color: var(--font-primary-dim);	
		width: max-content;
	}

	.help-link{
		margin-top: 0.5rem;
		font-weight: 100;
		align-self: flex-end;
	}
</style>

<h2>Welcome to Lamden Link</h2>
<div class="subtitle flex row wrap align-center">
	<p class="subtitle">A blockchain bridge made by Lamden. </p>
	<a class="help-link" href="https://help.lamdenlink.com/" target="_blank" rel="noopener noreferrer" > more info </a>
</div>

<div class="buttons flex">
	{#if hasPendingSwap}
		<BigButton title={"Resume A Swap"} icon="resume" action={handleResume} />
	{:else}
		<BigButton title={"Start A New Swap"} icon="start" action={handleStartNew} />
	{/if}
	
	{#if hasLastSwap}
		<BigButton title={"View Last Swap"} icon="results" action={handleViewLast} />
	{/if}
	<BigButton title={"Get Help"} icon="telegram" action={handleOpenSuport} />
</div>



