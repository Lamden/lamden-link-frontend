<script>
import Logo from './TauSVG.svelte'

let returnHome = function() {
    window.history.pushState("", "", "/")
    window.open("/", "_self")
    return ""
  }
</script>

<div class="nav-logo" on:click={() => returnHome()}>
    <Logo/>
    <div class="page-header-text">
        <div class="page-header">
            Lamden
        </div>
        <div class="conversion">
            1 TAU = 65 Stamps 
        </div>
    </div>
</div>

<style>
    
.page-header {
	font-size: x-large;
	font-weight: 600;
}
.conversion {
    margin-top: .25rem;
    font-size: x-small;
}
.nav-logo {
    cursor: pointer;
}
</style>