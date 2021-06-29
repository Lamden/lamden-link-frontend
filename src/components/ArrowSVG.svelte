<script>
  	import { lamden_origin } from "../stores/lamden";
  import Button from "./Button.svelte"

  let changeNetwork = function() {
    if ($lamden_origin) lamden_origin.set(false)
    else {
      lamden_origin.set(true);
      
    }
   }
</script>

<div class="arrow-container">
  <div>
  <svg viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
    <path
      d="M3.625 14.5C3.625 20.5061 8.4939 25.375 14.5 25.375C20.5061 25.375 25.375 20.5061 25.375 14.5C25.375 8.4939 20.5061 3.625 14.5 3.625C8.4939 3.625 3.625 8.4939 3.625 14.5Z"
      stroke="#42E8E0"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19.3333 14.5001L14.5 9.66675"
      stroke="#42E8E0"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19.3333 14.5L9.66668 14.5"
      stroke="#42E8E0"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.5 19.3333L19.3333 14.5"
      stroke="#42E8E0"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</div>
  <div class="switch">
    <button on:click={() => changeNetwork()}>Switch</button>
  </div>
</div>

<style>
    .arrow-container {
      width: 2.5rem;
        text-align: center;
    }
    .switch {
      font-size: x-small;
    text-align: center;
    }
</style>