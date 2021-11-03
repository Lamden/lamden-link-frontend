import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'

export const ethChainBalance = writable(new BN(0))
export const ethChainTokenBalance = writable(new BN(0))

export const withdrawTxStatus = writable({}) 
export const approvalTxStatus = writable({})  
export const depositTxStatus = writable({})  
export const confirmationsStatus = writable({})  