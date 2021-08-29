import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'

export const lwc = writable(null)
export const lamden_vk = writable(null)
export const lamdenWalletInfo = writable({})
export const hasNetworkApproval = writable({})
export const lamdenCurrencyBalance = writable(new BN(0))
export const lamdenTokenBalance = writable(new BN(0))
export const lamdenTokenApprovalAmount = writable(new BN(0))


// Results Trackers
export const burnTxStatus = writable({})
export const burnApprovalTxStatus = writable({})