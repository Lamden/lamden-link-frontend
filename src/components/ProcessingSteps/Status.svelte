<script>
    // Components
    import Loader from '../Loader.svelte'

    // Icons
    import IconInfo from '../SVG/InfoSVG.svelte'
    import IconError from '../SVG/ErrorSVG.svelte'

    export let statusStore
</script>

<style>
    .icon{
        margin-right: 20px;
    }
    .icon.info{
        width: 25px;
    }
    .icon.error{
        width: 25px;
    }
    .text-error{
        margin: 0.25 0;
    }
</style>

{#if $statusStore.loading}
    <div class="flex row align-center">
        <Loader />
        <p>{$statusStore.status}</p>
    </div>
{/if}

{#if $statusStore.errors}
    <div class="flex row align-center">
        <div class="icon error">
            <IconError />
        </div>
        {#each $statusStore.errors as error}
            <p class="text-error">{error}</p>
        {/each}
    </div>  
{/if}

{#if $statusStore.message}
    <div class="flex row align-center">
        <div class="icon info">
            <IconInfo />
        </div>
        <p>{$statusStore.message}</p>
    </div>
{/if}