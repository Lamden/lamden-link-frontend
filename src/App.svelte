<script lang="ts">
  import { ethTxHash, ethDepositTxHash } from "./stores/lamden";
  import { Router, Link, Route } from "svelte-routing";
  import Details from "./pages/Details.svelte";
  import Home from "./pages/Home.svelte";
  import { onMount } from 'svelte'
  
  onMount(() => {
    localStorage.setItem('swap_finished', 'false')
  })
  let update_url = function() {
    window.history.pushState("", "", "/")
    return ""
  }
</script>

<Router>
  <main>
    <div class="lamden-link">
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <Route path="/:origin/tx/:result" let:params>
        <Details result={params.result} origin={params.origin}/>
      </Route>
      <Route path="/">
        { update_url() }
        <Home />
      </Route>

    </div>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js"></script>
    <script
      src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js"></script>
    <script>
      VANTA.DOTS({
        el: "#app",
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x5420ff,
        color2: 0x161616,
        backgroundColor: 0x151515,
        size: 10,
        spacing: 70.0,
      });
    </script>
  </main>
</Router>

<style>
  #app {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;
    width: 100%;
    height: 100vh;
  }
  .lamden-link {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 9999;
    max-width: 1920px;
  }
</style>
