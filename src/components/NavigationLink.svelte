
<script lang='ts'>
    export let link: string;
    export let href: any;        
    
</script>


<div style="text-align: center;">
    <a on:click={href} href={'#'} target="" class="nav-link" >{link}</a>
</div>


<style>

    .nav-link {
        color: #e0e0e0;
        text-decoration: none;
    }
    .nav-link:hover {
        color: white;
    }

</style>

