<script lang="ts">
  import Info from "./InformationalSVG.svelte";
  import Arrow from "./ArrowSVG.svelte";
  import DropDown from "./DropDown.svelte";
  import Input from "./Input.svelte";
  import NetworkSelection from "./NetworkSelection.svelte";
  import Button from "./Button.svelte";
  import Popup from "./Popup.svelte"
  import { onMount } from "svelte";
  //import Alert from "../components/alert.svelte";
  import { projectConf } from "../conf.js";
  import {
    checkChain,
    checkETHBalance,
    checkLamdenBalance,
    network_to,
    network_from,
    set_swap_func,
    connect_lamden_wallet_button,
    connect_metamask_button,
  } from "../js/utils";
  import { chainData, selectedAccount } from "svelte-web3";
  import {
    vk,
    ethBalance,
    lamden_origin,
    tauBalance,
    checkTokenBalanceFunction,
    skipped,
    resume_burn,
    currentNetwork,
    token_selected,
message,
inputValue,
swap_details
  } from "../stores/lamden";

  let conf = projectConf[$currentNetwork];
  let lastTransfer;

  $: buttonDisabled =
    $chainData.chainId !== conf.ethereum.chainId ||
    $ethBalance.isLessThanOrEqualTo(0);

  chainData.subscribe((current) => checkChain(current));

  onMount(async () => {
    checkChain($chainData);
    checkETHBalance($selectedAccount);
    checkLamdenBalance();
  });
  
  $: {
    if ($selectedAccount && $currentNetwork) {
      checkETHBalance($selectedAccount);
       if ($token_selected) {
         $checkTokenBalanceFunction($token_selected, $selectedAccount);
      }
    }
  } 
  
  if (localStorage.getItem("current_network") === null) {
    currentNetwork.set("mainnet");
    localStorage.setItem("current_network", "mainnet");
  }
  else {
    currentNetwork.set(localStorage.getItem("current_network"));
  }

  let getLastSwap = function() {
    if (localStorage.getItem('swap_details')) {
      let last_swap = JSON.parse(localStorage.getItem('swap_details'))
      swap_details.set({'origin': last_swap.origin, 'result': last_swap.result, 'page_view': true})
    }
  }

  let clicked = function (network) {
    if (network == "mainnet") {
      localStorage.setItem("current_network", "testnet");
      currentNetwork.set("testnet");
    } else {
      localStorage.setItem("current_network", "mainnet");
      currentNetwork.set("mainnet");
    }
    connect_lamden_wallet_button();
    connect_metamask_button();
    checkLamdenBalance();
    checkETHBalance($selectedAccount);
    token_selected.set(null);
  };

  let setTestnetColor = function (network) {
    let base_styles = "font-weight: 700;font-size: 1rem;color:";
    if (network == "testnet") return base_styles + "#8c77ff";
    else return base_styles + "white";
  };

  let disableButton= function (error, token, input) {
  if (error || !token || !input) return true
  else return false
}

let link;
  $: {
    if (localStorage.getItem('lastTransfer')) {
      lastTransfer = JSON.parse(localStorage.getItem('lastTransfer'))
    }
  }

  let setColor = function () {
    if (lastTransfer.status == 'error') return 'see-details error'
    else return 'see-details details-success'
  }
</script>

<div class="bridge-connected">
  <Popup />
  <div class="boxes" style="margin-top:1.25rem;margin-bottom:1.25rem;min-width: 70%;display:grid;grid-template-columns: 1fr 1fr;max-width: 400px;">
    {#if (localStorage.getItem("current_network") == "testnet")}
       <input
        type="checkbox"
        id="box-1"
        on:click={clicked($currentNetwork)}
        checked
      />
    {:else}
       <input
        type="checkbox"
        id="box-1"
        on:click={clicked($currentNetwork)}
      />
    {/if}
    <label for="box-1" style={setTestnetColor($currentNetwork)}
      >Testnet</label
    >
    {#if lastTransfer}
    <div class={setColor()} on:click={() => getLastSwap()} style="float:right;text-align: right;">
      Previous Transaction
    </div>
  {/if}
  </div>


    <form
    on:submit|preventDefault={set_swap_func($lamden_origin)}
    action="#"
    method="POST"
    style="width:100%"
  >
    <div class="network-selection-container">
      <NetworkSelection
        direction={"From"}
        network={network_from($lamden_origin)}
      />
      <Arrow />
      <NetworkSelection direction={"To"} network={network_to($lamden_origin)} />
    </div>
    {#if $lamden_origin}
    <div style="display:flex;margin-right: 1.8rem;margin-top: 1rem;margin-bottom: 1rem;">
      {#if !$resume_burn}
      <Info />
        <Button text={"Resume Swap"} clicked={() => resume_burn.set(true)} />
      {:else}
      <Info />
        <Button
          text={"Create New Swap"}
          clicked={() => resume_burn.set(false)}
        />
      {/if}
    </div>
  {/if}
    {#if !$resume_burn}
      <div class="amount container">
        <DropDown network={network_from($lamden_origin)} />
      </div>
      <div class="amount container">
        <Input title={"Amount"} /> 
      </div>
    {:else}
      <div class="container">
        <Input title={"Lamden BURN Transaction Hash"} />
      </div>
    {/if}
    <div class="container" style="margin-top:1rem">
      {#if ($skipped)}
      <Button text={"CONNECT WALLETS"} clicked={() => skipped.set(false)} />

      {:else}
 
      <button type="submit" disabled={disableButton($message, $token_selected, $inputValue)}>
        <span class="button-text">
            {`SEND TOKENS TO ${network_to($lamden_origin).toUpperCase()}`}
        </span>
      </button>


      {/if}

    </div>
  </form>
</div>

<style>
  /*Page styles*/
  .details-success {
    color: #00ff37;
  }
  .amount {
    width: 70%;
  }
  /*Checkboxes styles*/
  input[type="checkbox"] {
    display: none;
  }

  input[type="checkbox"] + label {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 20px;
    font: 14px/20px "Open Sans", Arial, sans-serif;
    color: #ddd;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  input[type="checkbox"] + label:last-child {
    margin-bottom: 0;
  }

  input[type="checkbox"] + label:before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    border: 1px solid #f3f3f3;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.6;
    -webkit-transition: all 0.12s, border-color 0.08s;
    transition: all 0.12s, border-color 0.08s;
  }

  input[type="checkbox"]:checked + label:before {
    width: 10px;
    top: -5px;
    left: 5px;
    border-radius: 0;
    opacity: 1;
    border-top-color: transparent;
    border-left-color: transparent;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>
