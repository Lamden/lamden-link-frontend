<script>
    // Icons
    import IconLightningBolt from './SVG/LightningBoltSVG.svelte'
    import IconResults from './SVG/ResultsSVG.svelte'
    import IconArrowCircle from './SVG/ArrowCircleSVG.svelte'

    export let title
    export let icon
    export let action

    const iconMap = {
        start: IconLightningBolt,
        results: IconResults,
        resume: IconArrowCircle
    }

</script>

<style>
    div{
        width: fit-content;
        margin: 1rem;
    }
    button{
        width: 80px;
        padding: 15px;
        height: 80px;
        max-width: unset;
        max-height: unset;
        margin: 0;
        border-radius: 99px;
        border: 1px solid var(--color-white);
    }
    button:hover{
        border: 1px solid var(--accent-color);
    }
    button:active{
        border: 1px solid var(--accent-color);
    }
    p{
        color: var(--accent-color);
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 200;
    }
    p:hover{
        color: var(--white-color);
    }

    @media only screen and (min-width: 650px) {
		main{
			max-width: 1000px;
		}
	}
	@media only screen and (min-width: 1280px) {
        button{
            width: 90px;
            padding: 18px;
            height: 90px;

        }
	}
	@media only screen and (min-width: 2800px) {
        button{
            width: 200px;
            padding: 25px;
            height: 200px;
        }
	}

</style>

<div class="flex col just-center align-center">
    <button on:click={action}>
        <svelte:component this={iconMap[icon]} />
    </button>
    <p on:click={action}>{title}</p>
</div>
