
<script lang='ts'>
    export let text: string;
    export let clicked: any;
    export let button_class: string
</script>


<button type="submit" on:click={clicked} class={button_class}>
  <span class="button-text">
      {text}
  </span>
</button>


<style>

</style>

