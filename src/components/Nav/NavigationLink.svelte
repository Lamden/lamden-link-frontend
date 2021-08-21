
<script lang='ts'>
    export let link;
    export let href;        
    
</script>

<a href="{href}" target="_blank" rel="noopener noreferrer" class="nav-link" >{link}</a>

<style>

    .nav-link {
        color: var(--color-gray-5);
        text-decoration: none;
        font-size: 1vw;
        font-weight: 800;
        border-bottom: 2px solid transparent;
        margin: 0 10px;
    }
    .nav-link:hover {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
    }

</style>

