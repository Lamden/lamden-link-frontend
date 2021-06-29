<script>
  import { token_selected } from "../stores/lamden";
    export let symbol;
  export let name;
  export let img;

  let choose_token = function (symbol) {
    token_selected.set(symbol);
    document.getElementById(`${symbol}-entry`).style.backgroundColor = "#2f2f2f";
  };
  //
</script>

<div class="token-entry" on:click={() => choose_token(symbol)}>
  <div class="entry" id={`${symbol}-entry`}>
    <div class="token-img-border">
      <img src={img} class="token-img" alt="" style="width: 3rem;" />
    </div>

    <div class="token-information">
      <div class="token-symbol">
        {symbol}
      </div>
      <div class="token-name">
        {name}
      </div>
    </div>
  </div>
</div>

<style>
  .token-entry {
  }
  .token-symbol {
    font-weight: bolder;
  }
  .token-name {
    color: #aeafad;
  }
  .entry {
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-left: 1rem;
    display: grid;
    grid-template-columns: 1fr 3fr;
    font-size: larger;
    cursor: pointer;
    border-radius: 0.65rem;
  }
  .entry:hover {
    background-color: #232323;
  }
</style>
