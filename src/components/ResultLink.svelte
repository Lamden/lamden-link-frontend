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

    .address-link{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
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
    <a href="{makeURL()}" class:address-link={type === "address"} target="_blank" rel="noopener noreferrer">{title}</a>
    <button class="icon" on:click={open_url}>
        <IconLink />
    </button>
</div>