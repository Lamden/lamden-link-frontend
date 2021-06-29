<script>
  import {
    lamden_origin,
    isLoading,
    resume_burn,
    ethTxHash,
  } from "../stores/lamden";
  import Loader from "./Loader.svelte";
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte";
  import Info from "./InformationalSVG.svelte";
  export let title;
  export let description;
  export let error;
  export let status;
  export let success;
  let path;
  let openModal = function () {
 
    if (localStorage.getItem('swap_finished') != 'false') {
      let network;
      if ($lamden_origin) network = 'lamden';
      else network = 'ethereum'

      if (error) path = `${network}/tx/error/`;
      else path = `${network}/tx/success/`;

      window.open(path, "_self");
    }
    return "";
  };

  let getLastTrade = function() {
    let network = lastTransfer.network
    let status = lastTransfer.status
    link = `${network}/tx/${status}/`
    localStorage.setItem('swap_finished', 'true')
    window.open(link, "_self");

  }
  let lastTransfer;
  let link;
  $: {
    link = path;
    if (localStorage.getItem('lastTransfer')) {
      lastTransfer = JSON.parse(localStorage.getItem('lastTransfer'))
    }
  }

  let setColor = function () {
    if (lastTransfer.status == 'error') return 'see-details error'
    else return 'see-details success'
  }
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

  {#if $lamden_origin}
    <div style="float: right;margin-left:1rem;display:flex">
      {#if !$resume_burn}
        <Button text={"Resume Swap"} clicked={() => resume_burn.set(true)} />
        <Info />
      {:else}
        <Button
          text={"Create New Swap"}
          clicked={() => resume_burn.set(false)}
        />
        <Info />
      {/if}
    </div>
  {/if}

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

  {#if lastTransfer}
  <div class={setColor()} on:click={() => getLastTrade()}>
    Previous Transaction Details
  </div>
  {/if}
</div>

<style>
  .loading {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .see-details {
    margin-bottom: 1rem;
    cursor: pointer;
  }
  .success {
    color: rgb(43, 222, 98);
  }
  .error {
    color: rgb(222, 43, 43);
  }
  .see-details:hover {
    color: white;
  }
</style>
