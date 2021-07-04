<script>
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte"
  import {
    connect_metamask_button,
    connect_lamden_wallet_button,
  } from "../js/utils";
  import { connected } from "svelte-web3";
  import { connected_lwc, lwc_installed } from "../stores/lamden";
 
  let lamdenWalletConnected = false;
  let walletErrorMessage = "";
  let connected_eth = connected;


  let metamask_installed = window.ethereum;

  let buttonName = function(network, walletInstalled) {
      if (walletInstalled) return `CONNECT ${network} WALLET`;
     else return `GET ${network} WALLET`
   }
   let buttonFunction = function(network, walletInstalled) {
     if (walletInstalled) {
       if (network == 'METAMASK') return connect_metamask_button
       else return connect_lamden_wallet_button
     }
     else {
      if (network == 'METAMASK') return () => {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
      }
       else return () => {
        window.open('https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim?hl=en-US')
       }
     }
   }
  </script>

<div class="bridge-init-container">
  <div class="wallet-connect">
    <div class="buttons">
      {#if !$connected_eth}
        <Button
          text={buttonName('METAMASK', metamask_installed)}
          clicked={buttonFunction('METAMASK', metamask_installed)}
        />
      {:else}
        <Alert text={"METAMASK CONNECTED"} isError={false}/>
      {/if}
      {#if !$connected_lwc}

      <Button
      text={buttonName('LAMDEN', $lwc_installed)}
      clicked={buttonFunction('LAMDEN', $lwc_installed)}
      />
    {:else}
      <Alert text={"LAMDEN WALLET CONNECTED"} isError={false}/>
    {/if}
     
    </div>
  </div>
</div>

<style>
 
</style>
