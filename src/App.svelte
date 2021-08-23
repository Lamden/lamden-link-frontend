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
    margin: 0 auto;
    max-width: 2500px;
  }
</style>

<Router>
  <Banner />
  <NavBar />
  <main>
    <Route path="/"><Home /></Route>
    <Route path="/swap"><MakeSwap /></Route>
    <Route path="/results"><Results /></Route>
    <Route path="/finish"><Finish /></Route>
  </main>
  <Footer />
</Router>


