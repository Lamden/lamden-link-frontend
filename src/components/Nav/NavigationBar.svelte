<script lang="ts">
  import NavLogo from "./NavigationLogo.svelte";
  import NavLink from "./NavigationLink.svelte";
  import Hamburger from "../SVG/HamburgerSVG.svelte"
  let links = [
    { name: "Home", href: "/"},
    { name: "Explorer", href: "https://www.tauhq.com/"},
    { name: "Wallet", href: "https://lamden.io/quickstart"},
    { name: "Help", href: "https://help.lamdenlink.com/"},
  ];
</script>


<div id="mobileMenu" class="hamburger-menu">
  <div class="hamburger-content">
    <span class="mobile-close">&times;</span>
    <div style="font-size: larger; margin-top: 2rem;">
      {#each links as link}
		<NavLink link={link.name} href={link.href} mobile={true}/>
        <br/>
        <br/>
      {/each}
    </div>
  </div>
</div>

<div class="flex row align-center navigation-bar border-box">
    <div class="flex-grow nav-logo-container">
        <NavLogo />
	</div>
	<div class="hamburger-container">
		<Hamburger/>
	  </div>
    <div class="navigation-links flex row align-center just-end border-box">
      {#each links as link}
        <NavLink link={link.name} href={link.href} />
      {/each}
    </div>
  
</div>

<style>
    .navigation-bar {
		color: var(--bg-primary);
		position: absolute;
		padding: 1em 1.5em;
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;      
	}
	.navigation-links{
		display: none;
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

	@media only screen and (min-width: 650px) {
		.navigation-links {
			display: flex;
		}
		.hamburger-container{
			display: none;
		}
	}
</style>
