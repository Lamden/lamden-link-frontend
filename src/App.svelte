<script lang="ts">
import { Router, Route } from "svelte-routing";

// Components
import Home from "./pages/Home.svelte";
import MakeSwap from "./pages/MakeSwap.svelte";
import Results from "./pages/Results.svelte";
import Finish from "./pages/Finish.svelte";
import Banner from "./components/Banner.svelte";
import NavBar from "./components/Nav/NavigationBar.svelte";
import Footer from "./components/Footer.svelte";

// Misc
import { hydrateSwapHistory, hydrateSwapInfo } from './js/localstorage-utils'

import { onMount } from 'svelte'

onMount(() => {
	hydrateSwapHistory()
	hydrateSwapInfo()
	unregisterOldServiceWorkers()
})

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
	<Route path="/" component={Home} />
	<Route path="/swap" component={MakeSwap} />
	<Route path="/swap/:testnet" component={MakeSwap} />
	<Route path="/results" component={Results} />
	<Route path="/finish" component={Finish} />
</main>
<Footer />
</Router>


