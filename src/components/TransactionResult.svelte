<script>
  import Button from "./Button.svelte";
  import Success from "./ConnectedSVG.svelte";
  import Error from "./ErrorSVG.svelte";
  import { currentNetwork } from "../stores/lamden";

  export let status;
  export let network;

  let transactionResult;
  let buttonMessage;
  let isError = false;

  if (status == "error") {
    transactionResult = "Failed";
    buttonMessage = "Home";
    isError = true;
  } else {
    transactionResult = "Success";
    buttonMessage = "Back";
  }

  let etherscan_base;
  let lamdenscan_base;

  if (localStorage.getItem('current_network') == "mainnet") {
    etherscan_base = "https://etherscan.io/tx/";
    lamdenscan_base = "https://mainnet.lamden.io/transactions/";
  } else {
    etherscan_base = "https://kovan.etherscan.io/tx/";
    lamdenscan_base = "https://testnet.lamden.io/transactions/";
  }

  let returnHome = function () {
    window.history.pushState("", "", "/");
    window.open("/", "_self");
    return "";
  };

  let ethApprovalTxHash;
  let ethDepositTxHash;
  let ethTxHash;
  let lamdenApprovalTxHash;
  let lamdenBurnTxHash;
  let tokens_moved;

  $: {
    ethApprovalTxHash = JSON.parse(localStorage.getItem("ethApprovalTxHash"));
    ethDepositTxHash = JSON.parse(localStorage.getItem("ethDepositTxHash"));
    ethTxHash = JSON.parse(localStorage.getItem("ethTxHash"));

    lamdenApprovalTxHash = JSON.parse(
      localStorage.getItem("lamdenApprovalTxHash")
    );
    lamdenBurnTxHash = JSON.parse(localStorage.getItem("lamdenBurnTxHash"));
    tokens_moved = JSON.parse(localStorage.getItem("tokens_moved"));

    localStorage.setItem('lastTransfer', JSON.stringify({"status": status, "network": network}))

    console.table(
      localStorage.getItem("swap_finished"),
      lamdenApprovalTxHash,
      lamdenBurnTxHash,
      ethApprovalTxHash, 
      ethDepositTxHash,
    );
  }
</script>

{#if localStorage.getItem("swap_finished") != "false"}
  <div class="details-page">
    <div class="details">
      <div style="display: grid;grid-template-columns: 1fr 30fr;">
        <div class="alert">
          {#if isError}
            <Error />
          {:else}
            <Success />
          {/if}
        </div>
        <div class="detail-header">Transaction {transactionResult}</div>
      </div>
      {#if transactionResult == "Success"}
        <div class="transaction-info">
          {tokens_moved} WETH was transferred successfully.
        </div>
      {/if}

      <div>
        {#if network == 'lamden'}
          <div class="transaction-info link">
            <div class="transaction-title">Lamden Approval Tx Hash:</div>
            <a
              class="transaction-hash"
              href={lamdenscan_base + lamdenApprovalTxHash.hash}
              target="_blank"
            >
              {lamdenApprovalTxHash.hash}
            </a>
          </div>
          <div class="transaction-info link">
            <div class="transaction-title">Lamden Burn Tx Hash:</div>
            <a
              class="transaction-hash"
              href={lamdenscan_base + lamdenBurnTxHash.hash}
              target="_blank"
            >
              {lamdenBurnTxHash.hash}
            </a>
          </div>
          <div class="transaction-info link">
            <div class="transaction-title">Eth Tx Hash:</div>
            <a
              class="transaction-hash"
              href={etherscan_base + ethTxHash.hash}
              target="_blank"
            >
              {ethTxHash.hash}
            </a>
          </div>
        {:else}
          <div class="transaction-info link">
            <div class="transaction-title">Eth Approval Tx Hash:</div>
            <a
              class="transaction-hash"
              href={etherscan_base + ethApprovalTxHash.hash}
              target="_blank"
            >
              {ethApprovalTxHash.hash}
            </a>
          </div>
          <div class="transaction-info link">
            <div class="transaction-title">Eth Deposit Tx Hash:</div>
            <a
              class="transaction-hash"
              href={etherscan_base + ethDepositTxHash.hash}
              target="_blank"
            >
              {ethDepositTxHash.hash}
            </a>
          </div>
        {/if}
      </div>
      <div style="width: 30%;margin-top:1rem;">
        <button on:click={() => window.open("/", "_self")}>
          <span class="button-text">{buttonMessage}</span>
        </button>
      </div>
    </div>
  </div>
{:else}
  {returnHome()}
{/if}

<style>
  .alert {
    margin: auto;
  }
  .detail-header {
    font-size: 2rem;
    margin-left: 2rem;
  }
  .link {
    color: #4fb9ff;
  }
  .details {
    margin-left: auto;
    margin-right: auto;
    margin-top: 2rem;
    max-width: 500px;
  }
  .transaction-info {
    margin-top: 2rem;
    color: #aeafad;
  }
  .transaction-title {
    margin-bottom: .5rem;
  }
  .transaction-hash {
    word-break: break-all;
  }
</style>
