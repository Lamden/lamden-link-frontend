
<script lang='ts'>
    export let text: string;
    export let clicked: any;
</script>


<button type="submit" on:click={clicked}>
  <span class="button-text">
      {text}
  </span>
</button>


<style>

</style>

