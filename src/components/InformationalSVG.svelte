<script>

    import { popup_modal } from '../stores/lamden'

    let openModal = function () {
        popup_modal.set('info')
    var modal = document.getElementById("myModal");

    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
    }
</script>

<div class="informational-container" on:click={() => openModal()}>
    <svg viewBox="0 0 706 564" fill="none" xmlns="http://www.w3.org/2000/svg" class="info-button">
        <g filter="url(#filter0_d)">
        <ellipse cx="281" cy="277.501" rx="251" ry="251.501" fill="#1BC2B8"/>
        </g>
        <ellipse cx="281.5" cy="274.5" rx="220.5" ry="218.5" fill="#151515"/>
        <g filter="url(#filter1_d)">
        <path d="M232.4 392H331.6V376L300 369L299.6 286.6L301 199.8L296.4 192H287L231.4 198.8V217.6L265 223.6L266.4 286.6L266 369L232.4 376V392ZM256.8 124.6C256.8 131.933 259.067 137.867 263.6 142.4C268.267 146.933 274.4 149.2 282 149.2C290.133 149.2 296.333 147.067 300.6 142.8C305 138.533 307.2 132.467 307.2 124.6C307.2 117.267 304.867 111.333 300.2 106.8C295.667 102.267 289.6 100 282 100C273.867 100 267.6 102.133 263.2 106.4C258.933 110.667 256.8 116.733 256.8 124.6Z" fill="white"/>
        </g>
        <defs>
        <filter id="filter0_d" x="0" y="0" width="562" height="563.002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feMorphology radius="12" operator="dilate" in="SourceAlpha" result="effect1_dropShadow"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="9"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
        <filter id="filter1_d" x="229.4" y="100" width="104.2" height="298" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.88 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
        </defs>
        </svg>
        
</div>


<style>
    .informational-container {
        margin-left: 1rem;
    }
    .info-button {
        width: 1.75rem;
        margin-top: 1.38rem;
        cursor: pointer;
    }
</style>