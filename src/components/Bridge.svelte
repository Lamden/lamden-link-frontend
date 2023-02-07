<script>
  import { beforeUpdate } from "svelte";
  import WalletController from "lamden_wallet_controller";
  import {
    lwc,
    connected_lwc,
    lwc_installed,
    message,
    success,
    status,
    skipped,
    lamdenWalletInfo
  } from "../stores/lamden";
  import { connected, selectedAccount } from "svelte-web3";
  import Init from "./Bridge_Init.svelte";
  import Connect from "./Bridge_Connected.svelte";
  import Popup from "./Popup.svelte";
  import Header from "./BridgeHeader.svelte";
 import { onMount } from "svelte";

  let connected_eth = connected;
  //FORM Binds
  let methodName = "set_value";
  let networkType = "controllernet";
  let stampLimit = 50000;

  //DOM Binds
   let walletErrorMessage = "";

  $: walletInstalled = false;
  $: lamdenInfo = { wallets: [] };
  $: errors = [];
  let txStatus = "";
  let approvalHash = "";
  let reapprove = false;
  let newKeypair = false;


  onMount(() => {
     document.addEventListener("lamdenWalletSet", (event) => {
 
      if ($lwc) {
         $lwc.walletIsInstalled().then((installed) => {
          if (!installed) {
            walletErrorMessage = "Lamden wallet extension not found";
          }
        });
         $lwc.events.on("newInfo", handleNewInfo);
        if ($lwc.locked) {
          walletErrorMessage = "Please unlock your lamden wallet";
        }
 
        return () => {
          $lwc.events.removeListener("newInfo", handleNewInfo);
        };
      }
    });
    return () => {
      document.removeEventListener("lamdenWalletSet", handleNewInfo);
    };
  });

  const handleNewInfo = (data) => {
    $lamdenWalletInfo = data;
    const { errors } = data;
     if (errors && errors.length > 0) {
      for (const error of errors) {
        if (error.includes("You must be an authorized dApp")) {
          // to hide inital message
          //walletErrorMessage = "Please authorize the dApp";
          walletErrorMessage = "";
        } else if (error.includes("is Locked")) {
          walletErrorMessage = "Please unlock your lamden wallet";
        } else if (error.includes("User rejected")) {
          walletErrorMessage =
            "Connection Rejected. Refresh page to try again.";
        } else {
         }
      }
    } else {
      
      //console.log("connected");
    }
   };





  $: kwargs = {
    key_name: { type: "text", value: "" },
    key_value: { type: "text", value: new Date().toLocaleTimeString() },
  };

  $: contractMethods = null;

  let ArgTypes = ["text", "address", "data", "fixedPoint", "bool"];

  beforeUpdate(() => {
    document.addEventListener("lamdenWalletInfo", (event) => {
      walletInstalled = true;
      if (event.detail.errors) {
        errors = event.detail.errors;
        //console.log(event.detail.errors);
      } else {
        //console.log(event.detail);
        errors = [];
        lamdenInfo = { ...event.detail };
        if (lamdenInfo.wallets.length > 0) {
          kwargs["key_name"].value = lamdenInfo.wallets[0] + ":time";
          kwargs = { ...kwargs };
        }
      }
    });
    document.addEventListener("lamdenWalletTxStatus", (event) => {
      //console.log(event);
      let detail = event.detail;
      if (detail.status === "error") {
        errors =
          detail.data.errors ||
          detail.errors ||
          detail.data.resultInfo.errorInfo;
      }
      txStatus = { ...event.detail };
    });

    checkForWallet();
  });
  let walletInstalled = false;

  const checkForWallet = async () => {
    //console.log(walletInstalled)
    if (!walletInstalled) {
      setTimeout(() => {
        if (!walletInstalled) checkForWallet();
      }, 1000);
      document.dispatchEvent(new CustomEvent("lamdenWalletGetInfo"));
      let controller = new WalletController();
      //console.log(controller);
      await controller.walletIsInstalled().then((installed) => {
        lwc_installed.set(installed);
 
        //console.log(installed);
      });
      //console.log(walletInstalled);

      walletInstalled = controller.installed;
      if (walletInstalled) {
        lwc.set(controller);
         document.dispatchEvent(new CustomEvent("lamdenWalletSet"));
      }
      //console.log(walletInstalled);
    }
  };

  function sendTx() {
    errors = [];
    const detail = JSON.stringify({
      networkType,
      methodName,
      kwargs: {},
      stampLimit,
    });
    document.dispatchEvent(new CustomEvent("lamdenWalletSendTx", { detail }));
  }
</script>

<main style="width:100%">
 
  <div />
  {#if $connected_eth && $connected_lwc}
    <Popup />
    <Header
      title={"Bridge"}
      description={"You're connected to the bridge and good to go."}
      status={$status}
      error={$message}
      success={$success}
    />
    <Connect />
  {:else}
    <Header
      title={"Connect Wallets"}
      description={"To get started, you need to connect your Lamden wallet and your MetaMask wallet."}
      error={walletErrorMessage}
      status={null}
      success={null}
    />
    {#if ($skipped)}
    <Connect />
    {:else}
    <Init />
    <div class="skip-button">
      <span style="cursor: pointer" on:click={() => skipped.set(true)}>
        Skip
      </span>
    </div>
    {/if}
  {/if}
</main>

<style>
  .skip-button {
    color: white;
    font-size: 1.25rem;
    text-align: center;
    max-width: 19rem;
    margin-top: -4rem;
  
  }
</style>