<script>
    import { createEventDispatcher } from 'svelte'

    // MISC
    import { stringToFixed, determinePrecision } from '../js/global-utils'
    import BN from 'bignumber.js'

    const dispatch = createEventDispatcher();

    // DOM ELEMENT BINDINGS
    let inputElm;

    export let title = ""
    export let placeholder = "";
    export let styles = "";
    export let margin = "unset";
    export let startingValue = 0;

	const handleInputChange = (e) => {
		let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = validateValue
		}else{
			let value = new BN(e.target.value)
			if (determinePrecision(value) > 8){
				value = new BN(stringToFixed(value, 8))
				inputElm.value = stringToFixed(value, 8)
			}
			dispatchEvent(value)
		}
    }
    
    const dispatchEvent = (value) => dispatch('input', value)
</script>

<style>
    input{
        width: inherit;
        max-width: 220px;
    }
    label{
        width: -webkit-fill-available;
    }
</style>

<label style={`margin: ${margin}; ${styles}`}>{title}
    <input class="primaryInput"
        bind:this={inputElm}
        on:input={handleInputChange}
        value={startingValue}
        {placeholder}
    />
</label>
