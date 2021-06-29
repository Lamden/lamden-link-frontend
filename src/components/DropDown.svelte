<script>
  import { web3, selectedAccount, chainData } from "svelte-web3";
  import {
    vk,
    ethBalance,
    lamden_origin,
    tauBalance,
    checkTokenBalanceFunction,
    token_selected,
    eth_token_balance,
    lamden_token_balance,
    popup_modal
  } from "../stores/lamden";
  import {
    checkEthereumTokenBalance,
    checkLamdenTokenBalance,
  } from "../js/utils";
  import DropDownArrow from "./DropDownSVG.svelte";

  export let network;

  let current_network;
  let refresher = function (network) {
     if (current_network && current_network != network) {
       token_selected.set(null);
     }
    current_network = network;
    return "";
  };
  function checkTokenBalance(network) {
    let check_func;
    if (network == "Ethereum") {
      check_func = checkEthereumTokenBalance;
    } else {
      check_func = checkLamdenTokenBalance;
    }
    checkTokenBalanceFunction.set(check_func);
  }

  let openModal = function (network) {
    checkTokenBalance(network);
    popup_modal.set('select')
    var modal = document.getElementById("myModal");

    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  };

  $: arrow_color = '#888888'


</script>

<div>
  <fieldset class="bridge-field field-drop">
    <legend class="field-label">Token Name</legend>
    {refresher(network)}

    <div class="drop-down" on:click={() => openModal(network)}>
      {#if $token_selected}
      <div class="drop-down-text">{$token_selected}</div>
      {:else}
        <div class="drop-down-text">Select Token</div>
      {/if}
      <DropDownArrow/>
    </div>
  </fieldset>
  {#if $token_selected}
    {#if network == "Ethereum"}
      <div class="token-balance">
        Your {network}
        {$token_selected} balance is: {$eth_token_balance}
        {$token_selected}
      </div>
    {:else if network == "Lamden"}
      <div class="token-balance">
        Your {network}
        {$token_selected} balance is: {$lamden_token_balance}
        {$token_selected}
      </div>
    {/if}
  {/if}
</div>

<style>
  .token-balance {
    padding-left: 1rem;
    padding-top: 0.5rem;
  }
  .drop-down {
    width: 100%;
    height: 3rem;
    display: grid;
    grid-template-columns: 6fr 1fr;
  }
  .drop-down-text {
    margin-top: auto;
    margin-bottom: auto;
    text-align: center;
    cursor: pointer;
  }
  .drop-down:hover {
    color: white;
  }
</style>
