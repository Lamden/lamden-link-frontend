const Web3 = require('web3')

exports.handler = async (event, context) => {
	const { networkType, fromNetwork, eventType, fromBlock, toBlock } = event.queryStringParameters
	console.log(event.body)
	console.log(process.env[`${networkType}_${fromNetwork}_WEBSOCKET`])
	const { abi, address } = JSON.parse(event.body)

	const web3 = new Web3(process.env[`${networkType}_${fromNetwork}_WEBSOCKET`])

	const clearingHouseContract = new web3.eth.Contract(
        abi, address
    )

	const res =  await clearingHouseContract.getPastEvents(eventType, {
		fromBlock,
		toBlock
	})
	.then((events) => {
		return {
			statusCode: 200,
			body: JSON.stringify(events)
		}
	})
	.catch(err => {
		console.log({err})
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error: Could not get chain events." })
		};
	});

	return res
	
};