import { get } from "svelte/store";
import { binanceNetwork } from '../stores/globalStores';
import { web3 } from 'svelte-web3'

const tokensBurnedInputs = [
    {
        "indexed":false,
        "internalType":"address",
        "name":"token",
        "type":"address"
    },
    {
        "indexed":false,
        "internalType":"uint256",
        "name":"amount",
        "type":"uint256"
    },
    {
        "indexed":false,
        "internalType":"string",
        "name":"receiver",
        "type":"string"
    }
]

export async function getBSCEvent(fromBlock, toBlock, address, topic){
    let w3 = get(web3)
    let network = get(binanceNetwork)
    const { api_url, key} = network.bsc_scan

    return fetch(`${api_url}&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${address}&topic=${topic}&apiKey=${key}`)
    .then(res => res.json())
    .then(json => {
        const {result } = json
        

        if (!result || !Array.isArray(result)) throw new Error("Error: Invalid event payload")

        let decoded = result.map(log => {
            return w3.eth.abi.decodeLog(tokensBurnedInputs, log.data, log.topics);
        })
        
        return []
    })
}