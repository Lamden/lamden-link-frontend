const fetch = require("node-fetch");

const BLOCKSERVICE_URL = {
	testnet: "http://165.227.181.34",
	mainnet: "http://165.22.47.195"
}

const PORT = "3535"
const ENDPOINT = "current/one"

exports.handler = async (event, context) => {
	const { network, contract, vk, to } = event.queryStringParameters
	if (!network){
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error: No 'network' parm provided." }),
		};
	}

	let url = `${BLOCKSERVICE_URL[network]}:${PORT}/${ENDPOINT}/${contract}/balances/${vk}:${to}`

	try {
		const response = await fetch(url);
		let data = await response.json()
		console.log(data)
		if (!data)  {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: "Error: No data returned from blockservice" }),
			}
		}else{
			return { 
				statusCode: 200, 
				body: JSON.stringify( data) 
			};
		}
	} catch (error) {
		console.log(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Error: Failed fetching data' }),
		};
	}
};