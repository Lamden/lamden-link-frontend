import BigNumber from 'bignumber.js'
BigNumber.set({EXPONENTIAL_AT: 31});

import { get } from "svelte/store";
import { web3 } from 'svelte-web3'
import { Bridges } from '../stores/globalStores';


export const BN = BigNumber

export function get_bridge_info(token){
    const bridges = get(Bridges)
    
    return bridges[token.bridge]
}

export function populate_bridge_info(token){
    const bridges = get(Bridges)
    
    token.bridge = bridges[token.bridge]
}

export function eth_address_to_checksum(address){
    let w3 = get(web3)
    return w3.utils.toChecksumAddress(address)
}

export function openURL(url){
	window.open(url, '_blank');
}

export function isString(s) {
    return typeof s === 'string' || s instanceof String
}

export const stringToFixed = (value, precision) => {
	if (!value) return "0.0"
		try {
			var values = value.split('.')
		} catch {
			var values = value.toString().split('.')
        }
		if (!values[1]) return value
		else {
            if (values[1].length > precision) values[1] = values[1].substring(0, precision)
            if (values[1].length < precision) precision = values[1].length
            
            let decValue = parseInt(values[1].substring(0, precision))

			if (decValue === 0) return `${values[0]}`
			else {
				let decimals = values[1].substring(0, precision)
				for (let i = precision - 1; i >= 0; i--) {
					if (decimals[i] === '0') precision -= 1
					else i = -1
			}
			return `${values[0]}.${values[1].substring(0, precision)}`
		}
	}
}

export const copyToClipboard = ( textTOcopy='', callback=undefined ) => {
    try{
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "copyhelper");
        document.getElementById("copyhelper").value=textTOcopy;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        
    } catch (e) {
        throw new Error('unable to copy')
    }
    if (callback){callback()}
};

export const determinePrecision = (value) => {
	if (BN.isBigNumber(value)) value = value.toString()
	let valueStripped = stripTrailingZero(value)
	if (!valueStripped.includes(".")) return 0
	else {
		return valueStripped.split(".")[1].length
	}
}


function stripTrailingZero (value) {
    const removeZeros = (v) => {
        const numParts = v.split('.')
        let formatted = numParts[1]
        for (let i = numParts[1].length - 1; numParts[1][i] === '0' && typeof numParts[1][i] !== 'undefined'; i--) {
            formatted = formatted.slice(0, -1)
        }
        if (formatted === '') return numParts[0]
            return numParts[0] + '.' + formatted
    }

    const isDecmailString = (v) => {
        if (typeof v !== 'string') return false
        if (v.includes('.')) return true
        return false
    }

    if (isDecmailString(value)) {
          return removeZeros(value)
    } else {
          return value
    }
}

export function toBaseUnit(value, decimals) {
    const w3 = get(web3)

    if (!isString(value)) {
        throw new Error('Pass strings to prevent floating point precision issues.')
    }
    const ten = new w3.utils.BN(10)
    const base = ten.pow(new w3.utils.BN(decimals))

    // Is it negative?
    let negative = value.substring(0, 1) === '-'
    if (negative) {
        value = value.substring(1)
    }

    if (value === '.') {
        throw new Error(
            `Invalid value ${value} cannot be converted to` +
            ` base unit with ${decimals} decimals.`,
        )
    }

    // Split it into a whole and fractional part
    let comps = value.split('.')
    if (comps.length > 2) {
        throw new Error('Too many decimal points')
    }

    let whole = comps[0],
        fraction = comps[1]

    if (!whole) {
        whole = '0'
    }
    if (!fraction) {
        fraction = '0'
    }
    if (fraction.length > decimals) {
        throw new Error('Too many decimal places')
    }

    while (fraction.length < decimals) {
        fraction += '0'
    }

    whole = new w3.utils.BN(whole)
    fraction = new w3.utils.BN(fraction)
    let wei = whole.mul(base).add(fraction)

    if (negative) {
        wei = wei.neg()
    }

    return new w3.utils.BN(wei.toString(10), 10)
}