<script>
  import {
    lamden_origin,
    isLoading,
    resume_burn,
    swap_details,
    swap_finished,
  } from "../stores/lamden";
  import Loader from "./Loader.svelte";
  import Alert from "./Alert.svelte";

  export let title;
  export let description;
  export let error;
  export let status;
  export let success;

  let openModal = function () {
    if ($swap_finished) {
      let network;
      let result;
      if ($lamden_origin) network = "lamden";
      else network = "ethereum";

      if (error) result = `error`;
      else result = `success`;

      localStorage.setItem("swap_details", JSON.stringify({
          origin: network,
          result: result,
        })
      );
      swap_details.set({ origin: network, result: result, page_view: true });
    }

    return "";
  };

 
</script>

<div class="">
  <div>
    <div class="bridge-header">
      {title}
    </div>
  </div>

  <h3 class="description" style="width: 100%;">
    {description}
  </h3>

  

  {#if status && !success}
    <div class="loading">
      {#if $isLoading}
        <Loader />
      {/if}
      <div class="button-text" style="margin-left: 2.85rem;font-size: smaller;">
        {status}
      </div>
    </div>
  {:else if success}
    <div>
      <Alert text={success} isError={false} />
    </div>

    {openModal()}
  {:else if error}
    <div>
      <Alert text={error} isError={true} />
    </div>

    {openModal()}
  {/if}

  
</div>

<style>
  .loading {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .see-details:hover {
    color: white;
  }
</style>
