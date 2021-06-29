<script lang="ts">
  import Alert from "./Alert.svelte";
  import Header from "./BridgeHeader.svelte";
  import Arrow from "./ArrowSVG.svelte";
  import DropDown from "./DropDown.svelte";
  import Input from "./Input.svelte";
  import NetworkSelection from "./NetworkSelection.svelte";
  import Button from "./Button.svelte";
  import Popup from "./Popup.svelte";
  import { onMount } from "svelte";
  //import Alert from "../components/alert.svelte";
  import { projectConf } from "../conf.js";
  import {
    checkChain,
    checkETHBalance,
    checkLamdenBalance,
    network_to,
    network_from,
    set_swap_func, connect_lamden_wallet_button, connect_metamask_button
  } from "../js/utils";
  import { chainData } from "svelte-web3";
  import {
    vk,
    ethBalance,
    lamden_origin,
    tauBalance,
    checkTokenBalanceFunction,
    message,
    success,
    status,
    resume_burn,
    currentNetwork,
    token_selected
  } from "../stores/lamden";

  let tokenName = null;
  $: selectedToken = tokenName;
  let conf = projectConf[$currentNetwork];

  $: buttonDisabled =
    $chainData.chainId !== conf.ethereum.chainId ||
    $ethBalance.isLessThanOrEqualTo(0);

  chainData.subscribe((current) => checkChain(current));

  onMount(async () => {
     checkChain($chainData);
    checkETHBalance();
    checkLamdenBalance();
   });

  currentNetwork.set("mainnet");
  localStorage.setItem('current_network', "mainnet")

  let clicked = function (network) {
     if (network == "mainnet") {
      localStorage.setItem('current_network', "testnet")
      currentNetwork.set("testnet");
     }
    else {
      currentNetwork.set("mainnet");
      localStorage.setItem('current_network', "mainnet")
    }
    connect_lamden_wallet_button.clicked()
    connect_metamask_button.clicked()
    checkLamdenBalance()
    checkETHBalance()
    if ($checkTokenBalanceFunction) {
      $checkTokenBalanceFunction($token_selected);
    }   
  };

  let setTestnetColor = function (network) {
     let base_styles = "font-weight: 700;font-size: 1rem;color:";
    if (network == "testnet") return base_styles + "#89ed5b";
    else return base_styles + "#ff0000";
  };
  
</script>

<div class="bridge-connected">
  <Popup />
  <Header
    title={"Bridge"}
    description={"You're connected to the bridge and good to go."}
    status={$status}
    error={$message}
    success={$success}
  />
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
      <Button
        text={`SEND TOKENS TO ${network_to($lamden_origin).toUpperCase()}`}
        clicked={""}
      />

      <div class="boxes" style="float:right;margin:1.25rem">
        <input type="checkbox" id="box-1" on:click={clicked($currentNetwork)} />
        <label for="box-1" style={setTestnetColor($currentNetwork)}
          >Testnet</label
        >
      </div>
    </div>
  </form>
</div>

<style>

  /*Page styles*/
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
