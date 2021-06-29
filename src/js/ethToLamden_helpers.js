import {
  ethApprovalTxHash,
  ethDepositTxHash,
  success,
  message,
  status,
  isLoading,
  token_selected,
  vk,
  currentNetwork,
  swap_finished,
} from '../stores/lamden'
import { web3, selectedAccount, chainData } from 'svelte-web3'
import { get } from 'svelte/store'
import BN from 'bignumber.js'
import { projectConf } from '../conf.js'
import { checkEthTransactionUntilResult } from './utils'
let latest_network = get(currentNetwork)
let conf = projectConf[latest_network]

export const handleInput = (e) => {
  e.target.setCustomValidity('')
  e.target.value = e.target.value
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1')
}
export const handleInvalid = (e) =>
  e.target.setCustomValidity('A number is required')

function isString(s) {
  return typeof s === 'string' || s instanceof String
}

function toBaseUnit(value, decimals, BN) {
  if (!isString(value)) {
    throw new Error('Pass strings to prevent floating point precision issues.')
  }
  const ten = new BN(10)
  const base = ten.pow(new BN(decimals))

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

  whole = new BN(whole)
  fraction = new BN(fraction)
  let wei = whole.mul(base).add(fraction)

  if (negative) {
    wei = wei.neg()
  }

  return new BN(wei.toString(10), 10)
}

export async function startSwap(event) {
  let latest_token_selected = get(token_selected)
  if (latest_token_selected) {
    let tokenName
    localStorage.setItem('ethApprovalTxHash', JSON.stringify({ hash: '', success: false }))
    localStorage.setItem('ethDepositTxHash', JSON.stringify({ hash: '', success: false }))
    let latest_web3 = get(web3)
    let latest_network = get(currentNetwork)
    let conf = projectConf[latest_network]
    let latest_selectedAccount = get(selectedAccount)
    isLoading.set(true)
    message.set('')
    status.set('')

    const formData = new FormData(event.target)
    tokenName = get(token_selected).toString()
    const recipient = get(vk)
    let quantity = new BN(formData.get('quantity'))
    localStorage.setItem('tokens_moved', quantity.toFixed(5))

    const token = conf.ethereum.tokens.filter((t) => t.name === tokenName).pop()

    if (!token) {
      isLoading.set(false)
      message.set('Invalid Token Selected.')
      return
    }

    if (
      !recipient ||
      recipient.length != 64 ||
      !recipient.match(/[0-9A-Fa-f]{6}/g)
    ) {
      isLoading.set(false)
      message.set("Recipient's Lamden key is not correct.")
      return
    }
    if (quantity.isNaN() || quantity.isLessThanOrEqualTo(0)) {
      isLoading.set(false)
      message.set('Invalid quantity')
      return
    }

    quantity = toBaseUnit(
      quantity.toString(),
      token.decimals,
      latest_web3.utils.BN,
    ).toString()

    const erc20TokenContract = new latest_web3.eth.Contract(
      token.abi,
      token.address,
    )
    const clearingHouseContract = new latest_web3.eth.Contract(
      conf.ethereum.clearingHouse.abi,
      conf.ethereum.clearingHouse.address,
    )

    try {
      let currentBalance = await erc20TokenContract.methods
        .balanceOf(latest_selectedAccount)
        .call()

      currentBalance = new BN(currentBalance)

      if (currentBalance.isLessThan(quantity)) {
        message.set(`You do not have enough balance in your metamask wallet. 
			You currently own ${currentBalance.toFixed(
        token.decimals,
      )} ${tokenName} but you are trying to swap 
			${new BN(latest_web3.utils.fromWei(quantity.toString(), 'ether')).toFixed(
        token.decimals,
      )} ${tokenName} tokens.`)
        isLoading.set(false)
        return
      }
    } catch (error) {
       isLoading.set(false)
      message.set('Something went wrong.')
      return
    }

    status.set(
      'Sending Ethereum token approval transaction (check for metamask popup)...',
    )
    let approvalTxHashResult = await new Promise((resolver) => {
      const approve = erc20TokenContract.methods.approve(
        conf.ethereum.clearingHouse.address,
        quantity.toString(),
      )

      try {
        approve
          .send({ from: latest_selectedAccount })
          .once('transactionHash', (hash) => {
            localStorage.setItem('ethApprovalTxHash', JSON.stringify({ hash: hash, success: false }))
             checkEthTransactionUntilResult(hash, latest_web3, resolver)
          })
          .catch((err) => {
            if (err.code === 4001)
              resolver({
                status: false,
                message: 'User denied Metamask popup.',
              })
            else resolver({ status: false })
          })
      } catch (err) {
        resolver({ status: false })
      }
    })
    let latest_ethApprovalTxHash = JSON.parse(localStorage.getItem('ethApprovalTxHash'))

    if (!approvalTxHashResult.status) {
      let msg =
        approvalTxHashResult.message || 'Error sending Ethereum Transaction.'
      message.set(msg)
      localStorage.setItem('ethApprovalTxHash', JSON.stringify({
        hash: latest_ethApprovalTxHash.hash,
        success: false,
      }))

      return
    } else {
      localStorage.setItem('ethApprovalTxHash', JSON.stringify({
        hash: latest_ethApprovalTxHash.hash,
        success: true,
      }))
    }

    status.set(
      `Sending Ethereum ${tokenName} deposit transaction (check for metamask popup)...`,
    )
    let depositTxHashResult = await new Promise((resolver) => {
      const deposit = clearingHouseContract.methods.deposit(
        token.address,
        quantity.toString(),
        recipient,
      )

       try {
        deposit
          .send({ from: latest_selectedAccount })
          .once('transactionHash', (hash) => {
            localStorage.setItem('ethDepositTxHash', JSON.stringify({ hash: hash, success: false }))
             checkEthTransactionUntilResult(hash, latest_web3, resolver)
          })
          .catch((err) => {
            if (err.code === 4001)
              resolver({
                status: false,
                message: 'User denied Metamask popup.',
              })
            else resolver({ status: false })
          })
      } catch (err) {
        resolver({ status: false })
      }
    })

    let latest_ethDepositTxHash = JSON.parse(localStorage.getItem('ethDepositTxHash'))

    if (!depositTxHashResult.status) {
      let msg =
        depositTxHashResult.message || 'Error sending Ethereum Transaction.'
      message.set(msg)
      localStorage.setItem('ethDepositTxHash', JSON.stringify({
        hash: latest_ethDepositTxHash.hash,
        success: false,
      }))

      return
    } else {
      localStorage.setItem('ethDepositTxHash', JSON.stringify({
        hash: latest_ethDepositTxHash.hash,
        success: true,
      }))
    }
    isLoading.set(false)
    success.set('Swapping was successful')
    localStorage.setItem('swap_finished', 'true')
  }
}
