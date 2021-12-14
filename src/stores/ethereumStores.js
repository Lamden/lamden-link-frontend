import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'
BN.set({EXPONENTIAL_AT: 31});

export const ethChainBalance = writable(new BN(0))
export const ethChainTokenBalance = writable(new BN(0))
export const ethChainTokenAllowance = writable(new BN(0))

export const withdrawTxStatus = writable({}) 
export const approvalTxStatus = writable({})  
export const depositTxStatus = writable({})
export const TWB_withdrawTxStatus = writable({})  
export const currentBlockStatus = writable({}) 
export const checkEthEverntsStatus = writable({}) 
export const checkEthConfirmationsStatus = writable({}) 
export const checkEthTransactionsStatus = writable({}) 
