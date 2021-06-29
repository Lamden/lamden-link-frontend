<script lang="ts">
  import {
    handleInvalid,
    handleInput,
    handleTxHashInvalid,
    handleTxHashInput,
  } from "../js/utils";

  export let title: string;
</script>

<div>
  <fieldset class="field-enter bridge-field">
    <legend class="field-label">{title}</legend>
    <div class="drop-down">
      {#if title == "Amount"}
        <div class="page">
          <label class="field field_v1">
            <input
              class="form-control field__input"
              type="text"
              placeholder=""
              name="quantity"
              id="quantity"
              required
              pattern="^\d*\.?\d*$"
              on:invalid={handleInvalid}
              on:input={handleInput}
            />
            
          </label>
        </div>
      {:else}
        <div class="page">
          <label class="field field_v1">
            <input
              class="form-control field__input"
              type="text"
              placeholder=""
              name="txHash"
              id="txHash"
              required
              pattern="^[a-fA-F0-9]+$"
              minlength="64"
              on:invalid={handleTxHashInvalid}
              on:input={handleTxHashInput}
            />

          </label>
        </div>

      {/if}
    </div>
  </fieldset>
</div>

<style>

  .field {
    width: 100%;
  }

/*
=====
RESET STYLES
=====
*/
.drop-down {
  color: white;
}
.field__input{ 
  --uiFieldPlaceholderColor: var(--fieldPlaceholderColor, #ffffff);
  
  background-color: transparent;
  color: white;
  border-radius: 0;
  border: none;

  -webkit-appearance: none;
  -moz-appearance: none;

  font-family: inherit;
  font-size: inherit;
}

.field__input:focus::-webkit-input-placeholder{
  color: white;
}

.field__input:focus::-moz-placeholder{
  color: white;
}

/*
=====
CORE STYLES
=====
*/

.field{
  --uiFieldBorderWidth: var(--fieldBorderWidth, 2px);
  --uiFieldPaddingRight: var(--fieldPaddingRight, 1rem);
  --uiFieldPaddingLeft: var(--fieldPaddingLeft, 1rem);   

  display: var(--fieldDisplay, inline-flex);
  position: relative;
  font-size: var(--fieldFontSize, 1rem);
}

.field__input{
  box-sizing: border-box;
  width: var(--fieldWidth, 100%);
  height: var(--fieldHeight, 3rem);
  padding: var(--fieldPaddingTop, 1.25rem) var(--uiFieldPaddingRight) var(--fieldPaddingBottom, .5rem) var(--uiFieldPaddingLeft);
  border-bottom: var(--uiFieldBorderWidth) solid var(--fieldBorderColor, #626262);  
}

.field__input:focus{
  outline: none;
}

.field__input::-webkit-input-placeholder{
  opacity: 0;
  transition: opacity .2s ease-out;
}

.field__input::-moz-placeholder{
  opacity: 0;
  transition: opacity .2s ease-out;
}

.field__input:focus::-webkit-input-placeholder{
  opacity: 1;
  transition-delay: .2s;
}

.field__input:focus::-moz-placeholder{
  opacity: 1;
  transition-delay: .2s;
}




</style>
