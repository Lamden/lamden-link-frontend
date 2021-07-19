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
    isLoading,
    message,
    inputValue,
    swap_details,
    tokenBalance,
    eth_token_balance,
    lamden_token_balance
  } from "../stores/lamden";

  let conf = projectConf[$currentNetwork];
  let lastTransfer;

  $: buttonDisabled =
    $chainData.chainId !== conf.ethereum.chainId ||
    $ethBalance.isLessThanOrEqualTo(0);
  
  $: buttonErrorText = null

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

  let disableButton= function (error, token, input, resumeBurn, loading, ethBal, tauBal, ethTokenBal, lamdenTokenBal, lamdenOrigin) {
    buttonErrorText = null

    if (ethBal.isEqualTo(0)) {
      buttonErrorText = "INSUFFICIENT ETHEREUM BALANCE"
      return true
    }

    if (lamdenOrigin){
      if (token && lamdenTokenBal && lamdenTokenBal.isEqualTo(0)){
        buttonErrorText = `INSUFFICIENT ${token} BALANCE`
        return true
      }
      if (lamdenOrigin && tauBal.isEqualTo(0)) {
        buttonErrorText = "INSUFFICIENT TAU BALANCE"
        return true
      }
    }else{
      if (token && ethTokenBal && ethTokenBal.isEqualTo(0)){
        buttonErrorText = `INSUFFICIENT ${token} BALANCE`
        return true
      }
    }

    if (resumeBurn) {
      if (!input) return true
      const regex = /^[a-fA-F0-9]+$/;
      const found = input.match(regex);  
      if (found && input.length == 64) return false
      else {
        buttonErrorText = `INVALID LAMDEN HASH`
        return true
      }
    }else{
      if (!token || !input) return true
      else{
        if (lamdenOrigin){
          if (lamdenTokenBal && lamdenTokenBal.isLessThan(input)){
            buttonErrorText = `INSUFFICIENT ${token} BALANCE`
            return true
          }
        }else{
          if (ethTokenBal && ethTokenBal.isLessThan(input)){
            buttonErrorText = `INSUFFICIENT ${token} BALANCE`
            return true
          }
        }
      }
    }
    return false
}

let link;
  $: {
    if (localStorage.getItem('lastTransfer')) {
      lastTransfer = JSON.parse(localStorage.getItem('lastTransfer'))
    }
  }

  let setColor = function () {
    if (lastTransfer.status == 'error') return 'prev-tx-button see-details'
    else return 'prev-tx-button see-details details-success'
  }

  const handleResumeBurnClicked = (value) => {
    resume_burn.set(value)
    inputValue.set(null)
    message.set("")
  }
</script>

<div class="bridge-connected">
  <Popup />
  <div class="boxes" style="margin-top:1.25rem;margin-bottom:1.25rem;min-width: 70%;display:grid;grid-template-columns: 1fr 1fr;max-width: 400px;">
    {#if (localStorage.getItem("current_network") == "testnet")}
       <input
        type="checkbox"
        id="box-1"
        on:click={() => clicked($currentNetwork)}
        checked
      />
    {:else}
       <input
        type="checkbox"
        id="box-1"
        on:click={() => clicked($currentNetwork)}
      />
    {/if}

    <label for="box-1" style={setTestnetColor($currentNetwork)}>Testnet</label>

    {#if lastTransfer}
      <div class="description-link" style="float:right;text-align: right;" on:click={() => getLastSwap()}>
        {'view previous transaction details >>'}
      </div>
    {/if}
  </div>


    <form
    on:submit|preventDefault={(e) => set_swap_func($lamden_origin)(e)}
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
    <div>
      {#if !$resume_burn}
        <Button text={"Resume Previous Failed Swap"} clicked={() => handleResumeBurnClicked(true)} />
      {:else}
        <Button
          text={"Create New Swap"}
          clicked={() => handleResumeBurnClicked(false)}
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
      <a class="description-link" href="https://help.lamdenlink.com/#/swapTau2Eth?id=resume-a-swap-from-lamden-to-ethereum" target="_blank" rel="noopener noreferrer" >how do I resume a swap?</a>
    {/if}
    <div class="container" style="margin-top:1rem">
      {#if ($skipped)}
      <Button text={"CONNECT WALLETS"} clicked={() => skipped.set(false)} />

      {:else}
 
        <button type="submit" disabled={$isLoading || 
          disableButton(
            $message, 
            $token_selected, 
            $inputValue, 
            $resume_burn, 
            $isLoading, 
            $ethBalance, 
            $tauBalance, 
            $eth_token_balance,
            $lamden_token_balance, 
            $lamden_origin
          )}>
          <span class="button-text">
              {buttonErrorText || `SEND TOKENS TO ${network_to($lamden_origin).toUpperCase()}`}
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
  .prev-tx-button{
    text-decoration: underline;
    cursor: pointer;
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
  a{
    margin-top: 1rem;
    display: block;
  }
</style>
