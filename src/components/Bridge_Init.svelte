<script>
  import Header from "./BridgeHeader.svelte";
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte"
  import {
    connect_metamask_button,
    connect_lamden_wallet_button,
  } from "../js/utils";
  import { connected } from "svelte-web3";
  import { onMount } from "svelte";
  import { lamdenWalletInfo, currentNetwork, lwc, connected_lwc } from "../stores/lamden";
  import WalletController from "../js/LamdenWalletController";

  let lamdenWalletConnected = false;
  let walletErrorMessage = "";
  let connected_eth = connected;

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
      
      console.log("connected");
    }
   };

  
</script>

<div class="bridge-init-container">
  <Header
    title={"Connect Wallets"}
    description={"To get started, you need to connect your Lamden wallet and your MetaMask wallet."}
    error={walletErrorMessage}
  />
  <div class="wallet-connect">
    <div class="buttons">
      {#if !$connected_eth}
        <Button
          text={connect_metamask_button.title}
          clicked={connect_metamask_button.clicked}
        />
      {:else}
        <Alert text={"METAMASK CONNECTED"} isError={false}/>
      {/if}
      {#if !$connected_lwc}

      <Button
        text={connect_lamden_wallet_button.title}
        clicked={connect_lamden_wallet_button.clicked}
      />
    {:else}
      <Alert text={"LAMDEN WALLET CONNECTED"} isError={false}/>
    {/if}
     
    </div>
  </div>
</div>

<style>
 
</style>
