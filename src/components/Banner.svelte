<style>
    .banner-container{
        background-image: url('/static/images/banner.jpeg');
        height: 40vh;
        min-height: 40vh;
        background-size: cover;
        background-position-x: center;
        background-repeat: no-repeat;
        position: relative;
    }
    h1{
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: 10vw;
        color: #5f4c94;
        padding: 1rem 0;
        border-top: 1px solid #95c0f1;
        border-bottom: 1px solid #95c0f1;
        background: #ffffff66;
        margin: 0;
    }

    @media screen and (min-width: 650px) {
        h1{
            font-size: 5vw;
        }
        .banner-container{
            background-image: url('/static/images/banner.jpeg');
            height: 50vh;
            min-height: 50vh;
            background-size: cover;
            background-repeat: no-repeat;
            position: relative;
        }
    }
</style>

<div class="banner-container">
    <h1>Lamden Link</h1>
</div>