<script>
    import { getContext } from 'svelte'
    import { fade } from 'svelte/transition';

    // Components
    import NetworkLogo from './NetworkLogo.svelte'

    // Misc
    import { swapInfo } from '../../stores/globalStores'

    const { toNetworks, setStep } = getContext('current_swap')

    function handleNetworkSelected(e) {
        swapInfo.update(curr => {
            curr.to = e.detail
            return curr
        })
        setStep(2)
    }

</script>

<style>
    h2{
        text-align: center;
    }

    @media screen and (min-width: 430px) {

    }
</style>

<div class="flex col just-center" >
    <h2>Which Blockchain are you sending your tokens to?</h2>

    <div class="flex row align-center just-center networks">
        {#each toNetworks() as fn}
            <NetworkLogo networkName={fn} on:selected={handleNetworkSelected}/>
        {/each}
    </div>
</div>