<script>

  let openMobileMenu = function() {
    var modal = document.getElementById("mobileMenu");

    var span = document.getElementsByClassName("mobile-close")[0];

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

<div class="hamburger-container" on:click={() => openMobileMenu()}>
  <svg
    width="27"
    height="18"
    viewBox="0 0 27 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="float:right;margin:auto"
  >
    <path
      d="M0 0H26.25V2.91667H0V0ZM0 7.29167H26.25V10.2083H0V7.29167ZM0 14.5833H26.25V17.5H0V14.5833Z"
      fill="white"
    />
  </svg>
</div>

<style>
  .hamburger-container {
    background-color: gray;
    width: auto;
  }
</style>
