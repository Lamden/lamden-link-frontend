<script>
  import TokenEntry from "./TokenListEntry.svelte";
  import {
    checkTokenBalanceFunction,
    token_selected,
    currentNetwork,
    lamden_origin,
    popup_modal,
  } from "../stores/lamden";
  import { lweth_data, weth_data } from "../js/utils";
  import { projectConf } from "../conf.js";
  let conf = projectConf[$currentNetwork];

  let set_token = function () {
    $checkTokenBalanceFunction($token_selected);
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
  };

  let img_src;
  let token_name;
  let title;
  let etherscan_base;
  let lamdenscan_base;
  $: {
    if ($lamden_origin) {
      img_src = lweth_data;
      token_name = "Lamden WEth";
    } else {
      img_src = weth_data;
      token_name = "Ethereum WEth";
    }

    if ($popup_modal == "select") {
      title = "Select Token";
    }
    if ($popup_modal == "info") {
      title = "Help";
    }
    if ($popup_modal == "details") {
      title = "Transaction Details";
    }

    if ($currentNetwork == "mainnet") {
      etherscan_base = "https://etherscan.io/tx/";
      lamdenscan_base = "https://mainnet.lamden.io/transactions/";
    } else {
      etherscan_base = "https://kovan.etherscan.io/tx/";
      lamdenscan_base = "https://testnet.lamden.io/transactions/";
    }
  }
  console.log($lamden_origin);
</script>

<div id="myModal" class="modal">
  <!-- Modal content -->
  <div class="modal-content">
    <span class="close">&times;</span>
    <div class="modal-title">{title}</div>
    {#if $popup_modal == "select"}
      {#each conf.ethereum.tokens as token}
        <TokenEntry name={token_name} symbol={token.name} img={img_src} />
      {/each}
      {#if $token_selected}
        <button on:click={() => set_token()}> Choose </button>
      {:else}
        <button disabled> Choose </button>
      {/if}
    {/if}
    {#if $popup_modal == "info"}
      <div class="info-text">
        Resume your swap using your Lamden Burn Transaction Hash
      </div>
    {/if}
  </div>
</div>

<style>
  .info-text {
    margin-bottom: 2rem;
  }
  .transaction-title {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: x-large;
    font-weight: 200;
    color: #42e8e0;
  }
  .transaction-hash {
    word-wrap: break-word;
    text-decoration: none;
    color: rgb(238, 237, 237);
  }
  .transaction-hash:hover {
    color: white;
  }
  /* The Modal (background) */
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content */
  .modal-content {
    background-color: #151515;
    box-shadow: 0px 1px 4px 8px #00000038;
    margin: auto;
    padding: 20px;
    border: none;
    border-radius: 0.25rem;
    width: 80%;
    max-width: 20rem;
  }
  .modal-title {
    font-size: larger;
    font-weight: 500;
    text-align: center;
    margin-bottom: 2rem;
  }
  .modal-select {
    width: 100%;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  /* The Close Button */
  .close {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: rgb(124, 124, 124);
    text-decoration: none;
    cursor: pointer;
  }
</style>
