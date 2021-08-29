<script>
    import { onMount } from 'svelte'
    import { navigate } from "svelte-routing";

    import { clearCurrentSwap } from '../js/localstorage-utils'

    onMount(() =>{
        clearCurrentSwap()
        navigate("/results", { replace: true })
    })
</script>