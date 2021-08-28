<script>
    import { getContext } from 'svelte'

    // Components
    import NetworkLogo from './NetworkLogo.svelte'

    // Misc
    import { swapInfo } from '../../stores/globalStores'


    const { fromNetworks, toNetworks, setStep, goHome } = getContext('current_swap')

    function handleNetworkSelected(e) {
        swapInfo.update(curr => {
            curr.from = e.detail
            let interop = toNetworks(e.detail)
            if (interop.length > 1){
                setStep(1)
            }else{
                curr.to = interop[0]
                setStep(2)
            }
            return curr
        })
    }

</script>

<style>
    h2{
        text-align: center;
    }
    button{
        margin: 2rem auto;
    }

    @media screen and (min-width: 430px) {

    }
</style>

<div class="flex col just-center">
    <h2>Which Blockchain are are your tokens currently on?</h2>

    <div class="flex row align-center just-center networks">
        {#each fromNetworks() as fn }
            <NetworkLogo networkName={fn} on:selected={handleNetworkSelected}/>
        {/each}
    </div>
    <button on:click={goHome}>Home</button>
</div>