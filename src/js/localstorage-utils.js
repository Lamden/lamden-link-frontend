import { swapInfo, swapHistory  } from '../stores/globalStores'
import { get } from "svelte/store";
import { BN } from '../js/global-utils'

export function saveSwap(){
    setLSValue("current_swap", get(swapInfo))
}

export function getLastSwap(){
    let value = localStorage.getItem("current_swap")
    if (value === null) {
        return null
    } else {
        value = JSON.parse(value)
        let tokenAmount = new BN(value.tokenAmount)
        if (!tokenAmount.isNaN()) value.tokenAmount = tokenAmount
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

export function clearCurrentSwap(){
    setLSValue("current_swap", {})
    swapInfo.set({})
}

export function hydrateSwapInfo(){
    let value = localStorage.getItem("current_swap")
    if (value === null) {
        swapInfo.set({})
    } else {
        swapInfo.set(JSON.parse(value))
    }
}

export function hydrateSwapHistory(){
    let value = localStorage.getItem("swap_history")
    if (value === null) {
        swapHistory.set([])
    } else {
        swapHistory.set(JSON.parse(value))
    }
}

export function getSwapHistory(){
    let value = localStorage.getItem("swap_history")
    if (value === null) {
        return []
    } else {
        return JSON.parse(value)
    }
}

export function setSwapInHistory(swapData){
    let swapHistoryData = getSwapHistory()
    swapHistoryData.push(swapData)
    setLSValue("swap_history", swapHistoryData)
    swapHistory.set(swapHistoryData)
}

function setLSValue(key, value){
    localStorage.setItem(key, JSON.stringify(value))
}