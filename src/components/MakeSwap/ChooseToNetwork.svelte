<script>
    import { getContext } from 'svelte'
    import { fade } from 'svelte/transition';

    // Components
    import NetworkLogo from './NetworkLogo.svelte'

    const { swapInfo, fromNetworks, toNetworks, setStep } = getContext('current_swap')

    function handleNetworkSelected(e) {
        let interop = toNetworks(e.detail)
        swapInfo.update(curr => {
            curr.from = e.detail
            if (interop.length === 0) curr.to = interop[0]
            return curr
        })
        if (interop.length > 1){
            setStep(1)
        }else{
            setStep(2)
        }
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
    <h2>Which Blockchain are are your tokens currently on?</h2>

    <div class="flex row align-center just-center networks">
        {#each fromNetworks() as fn}
            <NetworkLogo networkName={fn} on:selected={handleNetworkSelected}/>
        {/each}
    </div>
</div>