<script>
    import { navigate } from "svelte-routing";

    // Misc
    import { swapInfo } from '../stores/globalStores'
    import { saveSwap } from '../js/localstorage-utils'

    let swapData;
    let validData = null;
    let datavalid = null;
    let error = null

    $: invalidData = datavalid === false && swapData

    const handleValidateData = (e) => {
        function errorIfInvalid(property){
            const { [property]: value } = pastedData
            if (typeof value === "undefined") throw new Error(`'${property}' property does not exists in Swap Data`)
        }

        error = null
        validData = null

        try{
            var pastedData = JSON.parse(swapData)

            let defaultValues = ["from", "to", "token", "mintedToken", "lamden_address", "metamask_address", "tokenAmount", "networkType"]
            for (let val of defaultValues){
                errorIfInvalid(val)
            }

            if (pastedData.from === "lamden"){
                errorIfInvalid("burnApproveHash")
                errorIfInvalid("burnHash")
            }else{
                errorIfInvalid("metamaskApproval")
                errorIfInvalid("metamaskDeposit")
            }

            validData = pastedData
            datavalid = true;
        }catch(e){
            console.log(e)
            error = e.message
            validData = null
            datavalid = false;
        }        
    }

    const handleEnterDetails = () => {
        handleValidateData()
        if (validData && datavalid) {
            if (!validData.startDate) validData.startDate = new Date()
            swapInfo.set(validData)
            saveSwap()
            setTimeout(gotoSwapPage, 1000)
        }
    }

    const gotoSwapPage = () => {
        navigate("/swap", { replace: true })
    }

    const handleInput = (e) => datavalid = null
    

</script>

<style>
    textarea{
        width: 100%;
        max-width: 550px;
        border: 3px solid transparent;
    }
    .validData{
        border: 3px solid var(--success-color);
    }
    .invalidData{
        border: 3px solid var(--warning-color);
    }
    h2{
        margin-bottom: 0;
    }
    p{
        font-size: 0.8em;
    }
    button{
        margin: 1rem 1em;
    }
</style>


<div class="flex col align-center just-center">
    <h2>Paste Swap Details</h2>
    <p class="text-warning">Only use if Lamden Link support has directed you too</p>
    <!-- svelte-ignore a11y-autofocus -->
    <textarea autofocus rows="20" bind:value={swapData} class:validData={datavalid} class:invalidData={invalidData} on:input={handleInput}/>
    <p class="text-error">{error == null ? "" : error}</p>
    <div class="buttons flex just-center">
        <button on:click={handleValidateData} disabled={!swapData}>
            Check Swap Details
        </button>
        <button on:click={handleEnterDetails} disabled={!swapData || validData == null}>
            {invalidData ? "Invalid Swap Data" : "Resume Swap"}
        </button>
    </div>
</div>



