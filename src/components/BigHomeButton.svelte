<script>
    // Icons
    import IconLightningBolt from './SVG/LightningBoltSVG.svelte'
    import IconResults from './SVG/ResultsSVG.svelte'
    import IconArrowCircle from './SVG/ArrowCircleSVG.svelte'
    import IconTelegram from './SVG/Telegram.svelte'

    export let title
    export let icon
    export let action

    const iconMap = {
        start: IconLightningBolt,
        results: IconResults,
        resume: IconArrowCircle,
        telegram: IconTelegram
    }

</script>

<style>
    .container{
        width: fit-content;
        margin: 1rem;
    }
    button.icon{
        width: 80px;
        padding: 15px;
        height: 80px;
        max-width: unset;
        max-height: unset;
        margin: 0;
        border-radius: 99px;
        border: 1px solid var(--color-white);
    }
    button.icon:hover{
        border: 1px solid var(--accent-color);
    }
    button.icon:active{
        border: 1px solid var(--accent-color);
    }
    button.text{
        color: var(--accent-color);
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 200;
    }
    button.text:hover{
        color: var(--white-color);
    }

    @media only screen and (min-width: 650px) {

	}
	@media only screen and (min-width: 1280px) {
        button.icon{
            width: 90px;
            padding: 18px;
            height: 90px;

        }
	}
	@media only screen and (min-width: 2800px) {
        button.icon{
            width: 200px;
            padding: 25px;
            height: 200px;
        }
	}

</style>

<button class="not-button container flex col just-center align-center">
    <button class="icon" on:click={action}>
        <svelte:component this={iconMap[icon]} />
    </button>
    <button class="text" on:click={action}>{title}</button>
</button>
