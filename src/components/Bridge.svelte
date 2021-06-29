<script>
  import { beforeUpdate } from "svelte";
  import WalletController from "../js/LamdenWalletController";
  import { lwc, connected_lwc } from "../stores/lamden";
  import { connected } from "svelte-web3";
  import Init from "./Bridge_Init.svelte";
  import Connect from "./Bridge_Connected.svelte";
  let connected_eth = connected;
  //FORM Binds
  let methodName = "set_value";
  let networkType = "controllernet";
  let stampLimit = 50000;

  //DOM Binds
  let selectedArgType, selectedVk, argNameInput;

  $: walletInstalled = false;
  $: lamdenInfo = { wallets: [] };
  $: errors = [];
  let txStatus = "";
  let approvalHash = "";
  let reapprove = false;
  let newKeypair = false;

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
        console.log(installed);
      });
      //console.log(walletInstalled);

      walletInstalled = controller.installed;
      if (walletInstalled) {
        lwc.set(controller);
        console.log('installed')
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
  <div></div>
  {#if $connected_eth && $connected_lwc}
    <Connect />
  {:else}
    <Init />
  {/if}

</main>
