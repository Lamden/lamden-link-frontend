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
        width: 80px;
        margin-right: 20px;
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
        <div class="icon">
            <IconError />
        </div>
        {#each $statusStore.errors as error}
            <p class="text-error">{$statusStore.error}</p>
        {/each}
    </div>  
{/if}

{#if $statusStore.message}
    <div class="flex row align-center">
        <div class="icon">
            <IconInfo />
        </div>
        <p>{$statusStore.message}</p>
    </div>
{/if}