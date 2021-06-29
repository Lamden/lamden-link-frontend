<script lang="ts">
  import NavLogo from "./NavigationLogo.svelte";
  import NavLink from "./NavigationLink.svelte";
  import Hamburger from "./HamburgerSVG.svelte"
  let links = [
    
    { name: "Lamden Link", href: () => {} },
    { name: "Explorer", href: () => {
      window.open('https://mainnet.lamden.io/')
    } },
    { name: "Wallet", href: () => {
      window.open('https://lamden.io/en/wallets/')
    } },
    { name: "Lamden.io", href: () => {
      window.open('https://lamden.io/en/')
    } },
  ];
</script>
<div id="mobileMenu" class="hamburger-menu">
  <div class="hamburger-content">
    <span class="mobile-close">&times;</span>
    <div style="font-size: larger; margin-top: 2rem;">
      {#each links as link}
        <NavLink link={link.name} href={link.href} />
        <br/>
        <br/>
      {/each}
    </div>
  </div>
</div>
<div class="navigation-bar">
    <div class="nav-logo-container">
        <NavLogo/>
    </div>
    <div class="hamburger-container">
      <Hamburger/>
    </div>
    <div class="navigation-bar-links">
      {#each links as link}
        <NavLink link={link.name} href={link.href} />
      {/each}
    </div>
  
</div>

<style>
    .navigation-bar-links {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;      
    }
    .navigation-bar {
      margin-top: 1rem;
      width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;      
    }
    .nav-logo-container {
      width: 40%;
    }
    .hamburger-menu {
      display: none;
      position: fixed; /* Stay in place */
      z-index: 1; /* Sit on top */
      padding-top: 100px; /* Location of the box */
      left: 0;
      top: -5rem;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }
    .hamburger-content {
        background-color: #151515;
    box-shadow: 0px 1px 4px 8px #00000038;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    border: none;
    border-radius: .25rem;
    width: 80%;
    max-width: 20rem;
    }
    .mobile-close {
      color: #aaaaaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }
    
    .mobile-close:hover,
    .mobile-close:focus {
      color: #000;
      text-decoration: none;
      cursor: pointer;
    }
</style>
