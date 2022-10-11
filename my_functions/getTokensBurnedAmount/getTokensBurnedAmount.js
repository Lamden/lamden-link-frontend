const fetch = require("node-fetch");
const BN = require('bignumber.js');
BN.set({EXPONENTIAL_AT: 31});

const BLOCKSERVICE_URL = {
	testnet: "http://165.227.181.34",
	mainnet: "http://165.22.47.195"
}

const PORT = "3535"
const ENDPOINT = "tx_history"

let fetchNext = false;
let historyData = []

const getDailyTxs = async (url, timestamp) => {
	const response = await fetch(url);
	let data = await response.json();
	if (data.history.length === 0) {
		return historyData
	}
	historyData.push(...data.history)
	// make sure if need to fetch next 10 history records
	let index = data.history.findIndex(x => x.timestamp < timestamp);
	fetchNext = index === -1;
	if (fetchNext) {
		return await getDailyTxs(url, timestamp)
	} else {
		return historyData
	}
}

exports.handler = async (event, context) => {
	const { network, vk, lamden_clearinghouse } = event.queryStringParameters
	if (!network){
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error: No 'network' parm provided." }),
		};
	}

	let startTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
	let endTime = new Date(new Date().setHours(23, 59, 59, 999)).getTime();

	let url = `${BLOCKSERVICE_URL[network]}:${PORT}/${ENDPOINT}/${vk}`

	try {
		let total = new BN(0)
		let data = await getDailyTxs(url, startTime);
		// make sure that tx is successful and burned token is lusd
		let burnedHistory = data.filter(x => 
			x.txInfo.status === 0
			&& x.txInfo.transaction.payload.contract === lamden_clearinghouse 
			&& x.txInfo.transaction.payload.function === "burn"
			&& x.txInfo.transaction.payload.kwargs.ethereum_contract === "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
		)
		burnedHistory.forEach(h => {
			let txTime = h.timestamp
			let amount = h.txInfo.transaction.payload.kwargs.amount.__fixed__ ? 
				new BN(h.txInfo.transaction.payload.kwargs.amount.__fixed__) : 
				new BN(h.txInfo.transaction.payload.kwargs.amount)
			if (txTime >= startTime && txTime <= endTime) {
				total.plus(amount)
			}
		});
		return {
			statusCode: 200,
			body: total.toString(),
		}

	} catch (error) {
		console.log(error);
		return {
			statusCode: 200,
			body: JSON.stringify({ error: error.message }),
		};
	}
};