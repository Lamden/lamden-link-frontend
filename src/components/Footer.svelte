<script>
import Heart from './SVG/HeartSVG.svelte'

</script>

<style>
    .footer{
        width: 100%;
        text-align: center;
        margin: 2rem 0;
        padding-bottom: 1rem;
        font-size: 0.8em;
        color: var(--font-primary-dim);
    }
    .heart-icon{
        width: 1em;
        margin: 0 8px;
    }
</style>

<div class="footer flex just-center align-end flex-grow">
    <div class="flex row align-center just-center">
        Made with 
        <div class="heart-icon">
            <Heart />
        </div> 
        by Lamden 
    </div>
</div>