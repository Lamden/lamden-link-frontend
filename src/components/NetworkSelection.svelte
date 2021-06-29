<script lang="ts">
  import { ethBalance, tauBalance, currentNetwork } from "../stores/lamden";
  import { checkETHBalance, checkLamdenBalance } from "../js/utils"
  export let network: string;
  export let direction: string;



</script>

<div class="network-field">
  <fieldset class="bridge-field">
    <legend class="field-label">{direction}</legend>
    <div>
      <div class="network">
        {network}
      </div>
    </div>
  </fieldset>
  <div class="description balance">
    <div>
      {#if network == "Ethereum"}
        {$ethBalance.toFixed(5)}
      {:else if network == "Lamden"}
        {$tauBalance.toFixed(5)}
      {/if}
      {#if network == "Ethereum"}
      {#if $currentNetwork === "mainnet"}
        {" ETH"}
        {:else}
        {" Kovan ETH"}
      {/if}
      {:else if network == "Lamden"}
        {#if $currentNetwork === "mainnet"}
          {" TAU"}
        {:else}
          {" DTAU"}
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .balance {
    font-size: smaller;
    padding-left: 1rem;
    padding-top: 0.5rem;
  }
  .network {
    padding-bottom: 0.5rem;
  }
</style>
