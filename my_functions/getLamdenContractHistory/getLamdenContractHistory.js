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

const ENDPOINT = "contract_history"

exports.handler = async (event, context) => {
    const { network, contract, start_block_num } = event.queryStringParameters

	if (!network || !Object.keys(BLOCKSERVICE_HOSTS).includes(network)){
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Error: Invalid 'network' parameter provided." }),
		};
	}

    const hosts = BLOCKSERVICE_HOSTS[network]
    const blockService_url = hosts[Math.floor(Math.random() * hosts.length)]

    let url = `${blockService_url}/${ENDPOINT}?contract=${contract}&start_block_num=${start_block_num}&limit=50`

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
				body: JSON.stringify(data) 
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