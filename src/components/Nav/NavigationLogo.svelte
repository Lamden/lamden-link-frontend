<script>
    import Logo from '../SVG/TauSVG.svelte'
</script>

<div class="flex row align-center container">
    <div class="flex align-center just-center nav-brand-logo">
        <Logo width="100%"/>
    </div>
    <a href="https://lamden.io/en/" class="page-header" target="_blank" rel="noopener noreferrer">
        Lamden.io
    </a>
</div>

<style>
    a{
        color: var(--color-gray-5);
        font-size: 20px;
        font-weight: 800;
    }
    .container:hover > a{
        color: var(--primary-color);
    }
    a:visited{
        color: var(--color-gray-5);
    }
    .nav-brand-logo {
        min-width: initial;
        color: var(--color-gray-5);
        width: 23px;
        margin-right: 10px;
    }

    @media screen and (min-width: 430px) {
        .nav-brand-logo {
            width: 35px;
        }
        a{
            font-size: 22px;
        }
    }
</style>