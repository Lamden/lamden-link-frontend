export const TransactionResultHandler = () => {
	let resultsObj = {}

	function parseTxResult(txResults, resultsTracker, callback) {
		if (txResults.errors || txResults.error) {
			parseTxErrors(txResults.errors || txResults.error)
		}else{
			if (txResults.hash){
				if (txResults.status === 0) {
					callback({...txResults, txHash: txResults.hash})
					return
				}
				if (txResults.status === 1) {
					parseTxErrors(txResults.result)
				}
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
		}

		resultsTracker.set({loading: false, ...resultsObj})
    }
    
	function parseTxErrors(errors){
		console.log({errors})
		if (Array.isArray(errors)){
			resultsObj.errors = errors
			for (let error in errors){
				if (error.includes("hit while checking for TX Result")) callback({recheck: true, txHash: txResults.hash || txResults.txHash})
			}
		}else{
			if (typeof errors === 'string'){
				resultsObj.errors = [error]
				if (error.includes("hit while checking for TX Result")) callback({recheck: true, txHash: txResults.hash || txResults.txHash})
			}else{
				resultsObj.errors = ['Unknown Transaction Error']
			}
		}
	}
	return {
	    parseTxResult
	}
}



