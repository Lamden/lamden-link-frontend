<script>
	import { onMount } from 'svelte'
	import { navigate } from "svelte-routing";

	// MISC
	import { lastSwap, swapInfo } from '../stores/globalStores'
	import { clearCurrentSwap } from '../js/localstorage-utils'

	$: hasLastSwap = !$lastSwap ? false : true
	$: hasPendingSwap = Object.keys($swapInfo).length > 0 ? true : false

	function handleStartNew(){
		clearCurrentSwap()
		navigate("/swap", { replace: true });
	}

	function handleResume(){
		console.log()
		navigate("/swap", { replace: true });
	}
	
	function handleViewLast(){
		navigate("/results", { replace: true });
	}

</script>

<style>
	.description{
		text-align: center;
	}
	button.big{
		padding: 10px;
		margin: 1rem;
	}
</style>

<h2>Welcome to Lamden Link!</h2>

<p class="description">
	New to Lamden? Read our <a class="description-link" href="https://blog.lamden.io/getting-started-on-lamden-2b73dc0a87b2" target="_blank">Getting Started</a> article.
</p>

<div class="flow row wrap">
	{#if hasPendingSwap}
		<button on:click={handleResume}>Resume A Swap</button>
	{:else}
		<button on:click={handleStartNew}>Start A New Swap</button>
	{/if}
	
	{#if hasLastSwap}
		<button on:click={handleViewLast}>View Last Swap</button>
	{/if}
</div>