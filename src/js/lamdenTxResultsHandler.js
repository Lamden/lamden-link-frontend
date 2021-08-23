export const TransactionResultHandler = () => {
	let resultsObj = {}

	function parseTxResult(txResults, resultsTracker, callback) {
		console.log({txResults})
		if (txResults.errors) {
			parseTxErrors(txResults.errors)
		}else{
			if (txResults?.txBlockResult?.errors?.length > 0) {
				let errors = txResults?.txBlockResult?.errors
				parseTxErrors(errors)
			}else{
				if (txResults.resultInfo.title === "Transaction Pending"){
					resultsObj.status = "Transaction sent, pending result"
				}
				if (typeof txResults.txBlockResult.status !== 'undefined') {
					if (txResults.txBlockResult.status === 0) {
						callback(txResults)
						return
					}
					if (txResults.txBlockResult.status === 1) {
						parseTxErrors(txResults.txBlockResult.errors)
					}
				}
			}

		}

		resultsTracker.set({loading: false, ...resultsObj})
    }
    
	function parseTxErrors(errors){
		if (Array.isArray(errors)){
			resultsObj.errors = errors
		}else{
			if (typeof errors === 'string'){
                resultsObj.errors = [error]
			}else{
				resultsObj.errors = ['Unknown Transaction Error']
			}
		}
	}
	return {
	    parseTxResult
	}
}



