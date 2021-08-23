import { writable, derived } from "svelte/store";
import * as networks from '../js/networks'

export const selectedNetwork = writable("testnet")

export const swapInfo = writable({})
export const selectedToken = derived(swapInfo, ($swapInfo) => $swapInfo.token)

export const networkInfo = derived(selectedNetwork, ($selectedNetwork) => networks[$selectedNetwork])
export const lamdenNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.lamden)
export const ethereumNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.ethereum)
export const binanceNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.binance)

export const getNetworkStore = (networkName) => {
    const networkMap = {
        "ethereum": ethereumNetwork,
        "lamden": lamdenNetwork,
        "binance": binanceNetwork
    }
    return networkMap[networkName] || null
}