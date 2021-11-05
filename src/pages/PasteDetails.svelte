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
            console.log({validData})
            swapInfo.set(validData)
            console.log({$swapInfo})
            saveSwap()
            //setTimeout(gotoSwapPage, 1000)
        }
    }

    const gotoSwapPage = () => {
        navigate("/swap", { replace: true })
    }

    const handleInput = (e) => datavalid = null
    
    let x = {
    "from": "lamden",
    "to": "binance",
    "token": {
      "name": "Lamden USD",
      "symbol": "LUSD",
      "equivalents": {
        "binance": [
          "USDT"
        ]
      },
      "address": "con_lusd_lst001",
      "lamden_clearinghouse": "con_lamden_link_bsc_v1"
    },
    "mintedToken": {
      "name": "BEP-20 USDT",
      "symbol": "USDT",
      "lamden_equivalent": "LUSD",
      "address": "0x55d398326f99059fF775485246999027B3197955",
      "decimals": 18,
      "lamden_clearinghouse": "con_lamden_link_bsc_v1"
    },
    "startDate": "2021-11-05T17:13:00.999Z",
    "lamden_address": "af0a8679b759e884c08e71a2482ff66ea2c1c6f38b9221b22584f46ff4eb4f13",
    "metamask_address": "0xa09d3068bf4c3bd10576a5d1337f6b9760486a99",
    "tokenAmount": "311.15996574",
    "burnHash": "626d26f3d151b102fac8cabbae6a1cf35bd34b4e184411e73de84b61774f038e",
    "networkType": "mainnet",
    "burnApproveHash": "97cd4f8c365f69e9e3554a989fc1b6eb6356beda3754788ebee99f08dfce017a"
  }

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



