<script>
    //Icons
    import IconLink from './SVG/LinkSVG.svelte'

    // Misc
    import { openURL } from '../js/global-utils'

    export let title
    export let network
    export let type
    export let hash

    function makeURL(){
        console.log(network)
        console.log({
            blockexplorer: network.blockexplorer,
            blockexplorer_address: network.blockexplorer_address,
            hash,
            type
        })
        if (type === "address"){
            return `${network.blockexplorer}/${network.blockexplorer_address}/${hash}`
        }

        if (type === "transaction"){
            return `${network.blockexplorer}/${network.blockexplorer_tx}/${hash}`
        }   
    }

    function open_url(){
        openURL(makeURL())
    }
</script>

<style>
    a{
        font-size: 0.8em;
    }
    div{
        height: 35px;
    }
    button{
        width: 25px;
        margin-left: 10px;
    }
    a:hover{
        color: var(--color-white);
        text-decoration: underline;
    }
</style>

<div class="flex row align-center">
    <a href="{makeURL()}" target="_blank" rel="noopener noreferrer">{title}</a>
    <button class="icon" on:click={open_url}>
        <IconLink />
    </button>
</div>