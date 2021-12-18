<script>
	import { Router, Route } from "svelte-routing";

	// Components
	import Maintenance from "./pages/Maintenance.svelte";
	import Home from "./pages/Home.svelte";
	import MakeSwap from "./pages/MakeSwap.svelte";
	import Results from "./pages/Results.svelte";
	import Finish from "./pages/Finish.svelte";
	import PasteDetails from "./pages/PasteDetails.svelte";
	import Restart from "./pages/Restart.svelte";
	import Banner from "./components/Banner.svelte";
	import NavBar from "./components/Nav/NavigationBar.svelte";
	import Footer from "./components/Footer.svelte";


	// Misc
	import { hydrateSwapHistory, hydrateSwapInfo } from './js/localstorage-utils'
	import { tabHidden } from './stores/globalStores'

	import { onMount } from 'svelte'

	let maintenance_on = false
	let allow_maintenance_swaps = false

	onMount(() => {
		hydrateSwapHistory()
		hydrateSwapInfo()
		unregisterOldServiceWorkers()

		document.addEventListener("visibilitychange", setTabActive);
		return () => {
			document.removeEventListener("visibilitychange", setTabActive);
		}
	})

	const setTabActive = () => {
		tabHidden.set(document.hidden)
	}

	function unregisterOldServiceWorkers(){
		if (typeof navigator === "undefined") return
		if (typeof navigator.serviceWorker === "undefined") return

		navigator.serviceWorker.getRegistrations()
		.then(registrations => {
			for(let registration of registrations) { 
				registration.unregister(); 
			}
			if (registrations.length > 0) window.location.reload()
		})
	}
</script>

<style>
	main{
		position: relative;
		padding: 1rem;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	@media only screen and (min-width: 650px) {
		main{
			max-width: 1000px;
		}
	}
	@media only screen and (min-width: 1280px) {
		main{
			max-width: 1280px;
		}
	}
	@media only screen and (min-width: 2800px) {
		main{
			max-width: 2800px;
		}
	}
</style>

<Router>
	<Banner />
	<NavBar />
	<main>
		{#if maintenance_on}
			<Route path="/" component={Maintenance} />
			{#if allow_maintenance_swaps}
				<Route path="/swap" component={MakeSwap} />
				<Route path="/swap/:testnet" component={MakeSwap} />
				<Route path="/results" component={Results} />
				<Route path="/finish" component={Finish} />
				<Route path="/pastedetails" component={PasteDetails} />
				<Route path="/restart" component={Restart} />
			{/if}
		{:else}
			<Route path="/" component={Home} />
			<Route path="/swap" component={MakeSwap} />
			<Route path="/swap/:testnet" component={MakeSwap} />
			<Route path="/results" component={Results} />
			<Route path="/finish" component={Finish} />
			<Route path="/pastedetails" component={PasteDetails} />
			<Route path="/restart" component={Restart} />
		{/if}
	</main>
	<Footer />
</Router>


