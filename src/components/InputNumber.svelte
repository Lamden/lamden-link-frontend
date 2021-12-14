<script>
    import { createEventDispatcher } from 'svelte'

    // MISC
    import { stringToFixed, determinePrecision, BN } from '../js/global-utils'

    const dispatch = createEventDispatcher();

    // DOM ELEMENT BINDINGS
    let inputElm;

    export let title = ""
    export let placeholder = "";
    export let styles = "";
    export let margin = "unset";
    export let startingValue = undefined;
    export let disabled = true;

    let prevValue = startingValue

	const handleInputChange = (e) => {
        let value = new BN(e.target.value)
        if (value.isNaN()) value = new BN(0)
        if (determinePrecision(value) > 6){
            value = new BN(stringToFixed(value, 6))
            inputElm.value = stringToFixed(value, 6)
        }
        dispatchEvent(value)

    }

    const handleValidateInput = (e) => {
        let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
		if (validateValue !== e.target.value) {
			inputElm.value = prevValue.toString()
		}else{
            prevValue = inputElm.value
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
        on:change={handleInputChange}
        on:input={handleValidateInput}
        value={startingValue}
        {placeholder}
        readonly={disabled}
    />
</label>
