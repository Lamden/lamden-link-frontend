
<script lang='ts'>
    export let link;
    export let href;  
    export let mobile = false      
    
</script>

{#if link === "Home"}
    <a href="{href}" class="nav-link" class:mobile={mobile}>{link}</a>
{:else}
    <a href="{href}" target="_blank" rel="noopener noreferrer" class="nav-link" class:mobile={mobile}>{link}</a>
{/if}

<style>

    .nav-link {
        color: var(--color-gray-5);
        text-decoration: none;
        font-size: clamp(16px, 1.2vw, 40px);
        font-weight: 800;
        border-bottom: 2px solid transparent;
        margin: 0 1em;
    }
    .nav-link:hover {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
    }

    a.mobile{
        color: var(--white-color);
    }
    a.mobile:hover{
        color: var(--accent-color);
        border-bottom: 2px solid var(--accent-color);
    }
    a.mobile:visited{
        color: var(--white-color);
    }

</style>

