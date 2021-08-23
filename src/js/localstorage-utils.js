import { swapInfo  } from '../stores/globalStores'
import { get } from "svelte/store";
import BN from 'bignumber.js'

export function saveSwap(){
    setLSValue("current_swap", get(swapInfo))
}

export function getLastSwap(){
    let value = localStorage.getItem("current_swap")
    if (value === null) {
        return null
    } else {
        value = JSON.parse(value)
        value.tokenAmount = new BN(value.tokenAmount)
        return value
    }
}

export function setLastSwap(){
    let value = localStorage.getItem("current_swap")
    if (value === null) {
        return null
    } else {
        value = JSON.parse(value)
        value.tokenAmount = new BN(value.tokenAmount)
        swapInfo.set(value)
    }
}


function setLSValue(key, value){
    localStorage.setItem(key, JSON.stringify(value))
}