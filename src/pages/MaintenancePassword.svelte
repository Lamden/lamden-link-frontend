<script>
	import { navigate } from "svelte-routing";

	import Button from '../components/Button.svelte';
	import { maintenance_unlocked } from '../stores/globalStores'

	let password = ""

	function handle_click(){
		if (password === "lamden_maint"){
			maintenance_unlocked.set(true)
			navigate("/")
		}
	}
</script>

<h2>Enter Maintenance password</h2>
<div class="flex col">
	<input bind:value={password} type="text" placeholder="Enter Maintence Password"/>
	<Button clicked={handle_click} text="Unlock" />
</div>

<p>
	Maintenance Unlocked: {$maintenance_unlocked}
</p>

<style>
	input{
		max-width: 300px;
	}

</style>






