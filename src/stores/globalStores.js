import { writable, derived } from "svelte/store";
import * as networks from '../js/networks'

export const selectedNetwork = writable("mainnet")
export const tabHidden = writable(false);

export const maintenance_on = writable(false);
export const maintenance_unlocked = writable(false)

export const swapInfo = writable({})
export const swapHistory = writable([])

export const selectedToken = derived(swapInfo, ($swapInfo) => $swapInfo.token)

export const networkInfo = derived(selectedNetwork, ($selectedNetwork) => networks[$selectedNetwork])
export const lamdenNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.lamden)
export const ethereumNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.ethereum)
export const binanceNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.binance)
export const Bridges = derived(networkInfo, ($networkInfo) => $networkInfo.bridges)

export const getNetworkStore = (networkName) => {
    const networkMap = {
        "ethereum": ethereumNetwork,
        "lamden": lamdenNetwork,
        "binance": binanceNetwork
    }
    return networkMap[networkName] || null
}

export const lastSwap = derived(swapHistory, ($swapHistory) => {
    let swap = null
    if ($swapHistory.length > 0) swap = $swapHistory[$swapHistory.length - 1]
    else return null

    let network = networks[swap.networkType]

    swap.toNetwork = network[swap.to]
    swap.fromNetwork = network[swap.from]

    return swap
})