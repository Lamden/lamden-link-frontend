<script>
  import NavBar from "../components/NavigationBar.svelte";
  import TransactionResult from "../components/TransactionResult.svelte"
  import Footer from "../components/Footer.svelte";


  export let origin;
  export let result;
</script>

<div>
  <NavBar />
  <TransactionResult status={result} network={origin}/>
  <Footer />
</div>

<style>


</style>