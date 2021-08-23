import BN from 'bignumber.js'

export function openURL(url){
	window.open(url, '_blank');
}

export function isString(s) {
    return typeof s === 'string' || s instanceof String
}

export const stringToFixed = (value, precision) => {
	if (BN.isBigNumber(value) && precision ) value = value.toFixed(precision)
	if (!value) return "0.0"
		try {
			var values = value.split('.')
		} catch {
			var values = value.toString().split('.')
		}
		if (!values[1]) return value
		else {
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