<script lang="ts">
  import Success from "./ConnectedSVG.svelte";
  import Error from "./ErrorSVG.svelte"

  export let isError: Boolean;
  export let text: string;
  let connected_msg = false
  if (text.includes("CONNECTED")) {
    connected_msg = true
  }

  function setClass(error) {
    if (connected_msg) return 'connected msg'
    else {
      if (error) return 'error msg'
    else return 'success msg'
    }

  }
</script>

<div class="alert container">
  {#if (isError)}
  <Error/>
  {:else}
  <Success/>
  {/if}
  <span class={"button-text " + setClass(isError)}>
    {text} 
  </span>
</div>

<style>
  .alert {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    margin-left: .75rem;
  }
  .msg {
    margin-left: 1.75rem;
    font-size: smaller;

  }

</style>
