import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'
BN.set({EXPONENTIAL_AT: 31});

export const lwc = writable(null)
export const lamden_vk = writable(null)
export const lamdenWalletInfo = writable({})
export const hasNetworkApproval = writable({})
export const lamdenCurrencyBalance = writable(new BN(0))
export const lamdenTokenBalance = writable(new BN(0))
export const lamdenTokenApprovalAmount = writable(new BN(0))

export const isTrackedAddress = derived(lamden_vk, ($lamden_vk) => $lamden_vk === "tracked_address");

// Results Trackers
export const burnTxStatus = writable({})
export const burnApprovalTxStatus = writable({})
export const depositTxStatus = writable({})
export const depositApprovalTxStatus = writable({})
export const checkLamdenCurrentBlockStatus = writable({})
export const checkLamdenEventStatus = writable({})