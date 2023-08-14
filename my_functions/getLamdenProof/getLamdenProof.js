const fetch = require("node-fetch");

const BLOCKSERVICE_HOSTS = {
	testnet: [
        "https://testnet-v2-bs-lon.lamden.io",
        "https://testnet-v2-bs-sf.lamden.io",
        "https://testnet-v2-bs-bang.lamden.io"
    ],
	mainnet: [
		"https://arko-bs-1.lamden.io"
	]
}

const ENDPOINT = "current/one"

exports.handler = async (event, context) => {
	const { network, clearinghouse,  unSignedABI} = event.queryStringParameters
	
	if (!network || !Object.keys(BLOCKSERVICE_HOSTS).includes(network)){
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error: Invalid 'network' parameter provided." }),
		};
	}

	const hosts = BLOCKSERVICE_HOSTS[network]
    const blockService_url = hosts[Math.floor(Math.random() * hosts.length)]

	let url = `${blockService_url}/${ENDPOINT}/${clearinghouse}/proofs/${unSignedABI}`

	try {
		const response = await fetch(url);
		let data = await response.json()

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