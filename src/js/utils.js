import { ethStore, web3, connected, selectedAccount } from 'svelte-web3'
import WalletController from './LamdenWalletController'
import { projectConf } from '../conf'
import {
    vk,
    ethBalance,
    tauBalance,
    lwc,
    connected_lwc,
    message,
    resume_burn,
    eth_token_balance,
    lamden_token_balance,
    currentNetwork,

} from '../stores/lamden'
import {get } from 'svelte/store'
import BN from 'bignumber.js'
import { startBurn, resumeBurn } from './lamdenToEth_helpers'
import { startSwap } from './ethToLamden_helpers'

export default connected

export let handleMetaMaskError = function(walletConnected) {
    let errorListener
    let errorMessageg
    let errorHandler = function(event) {
        errorMessage = event.detail
    }
    if (!walletConnected && !errorListener) {
        //document.addEventListener('metamaskError', (e) => errorHandler(e));
        errorListener = true
    } else {
        if (errorListener) {
            //document.removeEventListener('metamaskError', (e) => errorHandler(e))
        }
    }
    if (errorMessage) {
        return errorMessage
    }
}

async function connectMetamask(event) {
    let metamaskError
    try {
        await ethStore.setBrowserProvider()
    } catch (error) {
        if (error.code === -32002) {
            metamaskError = 'Please open metamask and accept the connection request.'
        } else if (error.code === 4001) {
            metamaskError = 'Request Rejected.'
        } else {
            metamaskError = 'Something went wrong.'
        }
    }
    if (metamaskError) {
        const error = new CustomEvent('metamaskError', { detail: metamaskError })
        dispatchEvent(error)
    }
}

function connect_lamden_wallet() {
    let lamdenWallet = get(lwc)
    let latest_network = get(currentNetwork)
    if (lamdenWallet && !lamdenWallet.locked) {
        lamdenWallet.sendConnection(
            //projectConf[$currentNetwork].lamden.clearingHouse
            projectConf[latest_network].lamden.clearingHouse,
        )
        connected_lwc.set(true)
    }
}

export const checkForLamdenWallet = async() => {
    let controller = new WalletController()
    let walletInstalled

    await controller.walletIsInstalled().then((installed) => {
        if (installed) {
            walletInstalled = true
        } else {
            //console.log('install wallet')
        }
    })
}
export const connect_metamask_button = connectMetamask;

export const connect_lamden_wallet_button = connect_lamden_wallet;

export const checkEthTxStatus = async(txHash, web3) => {
    //console.log({ checking: txHash })
    try {
        let response = await web3.eth.getTransactionReceipt(txHash)
        return response
    } catch (e) {}
    return false
}

export const checkEthTransactionUntilResult = async(
    txHash,
    web3,
    resolver,
) => {
    let txHashInfo = await checkEthTxStatus(txHash, web3)
    if (!txHashInfo || !txHashInfo.status)
        setTimeout(
            () => checkEthTransactionUntilResult(txHash, web3, resolver),
            5000,
        )
    else resolver(txHashInfo)
}

export function setNetwork(direction, from_lamden) {
    let origin
    let destination
    if (from_lamden) {
        origin = 'Lamden'
        destination = 'Ethereum'
        checkTokenBalanceFunction.set(checkLamdenTokenBalance)
    } else {
        origin = 'Ethereum'
        destination = 'Lamden'
        checkTokenBalanceFunction.set(checkEthereumTokenBalance)
    }
    if (direction == 'from') return origin
    else return destination
}

export function checkChain(current) {
    let latest_network = get(currentNetwork)
    let latest_selectedAccount = get(selectedAccount)
    let conf = projectConf[latest_network]
    let alternate_network = 'Ethereum Mainnet'
    if (latest_network == 'mainnet') alternate_network = 'Kovan Test Network'

    if (current.chainId !== conf.ethereum.chainId) {
        message.set(`Switch Metamask to ${conf.ethereum.networkName}.`)
        return
    }
    let msg = get(message)

    if (current.chainId === conf.ethereum.chainId) {

        if (
            msg === `Switch Metamask to ${conf.ethereum.networkName}.` ||
            msg === `Switch Metamask to ${alternate_network}.`
        ) {
            message.set('')
            checkETHBalance(latest_selectedAccount)
            checkLamdenBalance()
        }
    }
}

export async function checkETHBalance(latest_selectedAccount) {
    if (!latest_selectedAccount) return
    let latest_web3 = get(web3)
    await latest_web3.eth.getBalance(latest_selectedAccount).then((res) => {
        ethBalance.set(new BN(latest_web3.utils.fromWei(res, 'ether')))
    })
}

export async function checkLamdenBalance() {
    let latest_network = get(currentNetwork)
    let conf = projectConf[latest_network]
    let latest_vk = get(vk)
    if (!latest_vk) return
    try {
        const res = await fetch(
            `${conf.lamden.network.apiLink}/states/currency/balances/${latest_vk}`, {
                method: 'GET',
            },
        )
        if (res.status === 200) {
            const value = (await res.json()).value
            if (value) {
                if (value.__fixed__) tauBalance.set(new BN(value.__fixed__))
                else tauBalance.set(new BN(value))
            } else {
                tauBalance.set(new BN(0))
            }
        }
    } catch (error) {
        tauBalance.set(new BN(0))
    }
}

export let network_to = function(from_lamden) {
    if (from_lamden) return 'Ethereum'
    else return 'Lamden'
}
export let network_from = function(from_lamden) {
    if (from_lamden) return 'Lamden'
    else return 'Ethereum'
}

export let set_swap_func = function(from_lamden) {
    console.log({ from_lamden, resume_burn: get(resume_burn) })
    if (get(resume_burn)) {
        return resumeBurn
    } else {
        if (from_lamden) return startBurn
        else return startSwap
    }
}

export const handleInput = (e) => {
    e.target.setCustomValidity('')
    e.target.value = e.target.value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1')
}
export const handleInvalid = (e) =>
    e.target.setCustomValidity('A number is required')

export const handleTxHashInput = (e) => e.target.setCustomValidity('')
export const handleTxHashInvalid = (e) =>
    e.target.setCustomValidity('Invalid Lamden Transaction Hash')

let tokenName = null
export async function checkEthereumTokenBalance(selected_token, latest_selectedAccount) {
    if (selected_token) {
        let latest_network = get(currentNetwork)
        let conf = projectConf[latest_network]
        tokenName = selected_token
        const token = conf.ethereum.tokens.filter((t) => t.name === tokenName).pop()
        let latest_web3 = get(web3)
        try {
            const erc20TokenContract = new latest_web3.eth.Contract(
                projectConf.ERC20_ABI,
                token.address,
            )
            const val = await erc20TokenContract.methods
                .balanceOf(latest_selectedAccount)
                .call()
            if (val) {
                eth_token_balance.set(new BN(latest_web3.utils.fromWei(val, 'ether')))
            } else {
                eth_token_balance.set(new BN(0))
            }

        } catch (error) {
            //console.log(error)
        }
    }
}

export async function checkLamdenTokenBalance(selected_token, latest_selectedAccount = null) {
    if (selected_token) {
        let latest_network = get(currentNetwork)
        let conf = projectConf[latest_network]
        tokenName = selected_token
        const token = conf.ethereum.tokens.filter((t) => t.name === tokenName).pop()
        try {
            let latest_vk = get(vk)
            const res = await fetch(
                `${conf.lamden.network.apiLink}/states/${conf.lamden.token.contractName}/balances/${latest_vk}`, {
                    method: 'GET',
                },
            )
            if (res.status === 200) {
                const value = (await res.json()).value
                if (value) {
                    if (value.__fixed__) lamden_token_balance.set(new BN(value.__fixed__))
                    else lamden_token_balance.set(new BN(value))
                } else {
                    lamden_token_balance.set(new BN(0))
                }
            }
        } catch (error) {
            lamden_token_balance.set(new BN(0))
        }
    } else {
        tokenName = ''
    }
}

export let weth_data =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAABYlAAAWJQFJUiTwAAAGxmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDYtMjBUMTI6Mzk6NTItMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA2LTIwVDE3OjM4OjA4LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA2LTIwVDE3OjM4OjA4LTA0OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjEyNGY4NzAwLTE5YjItNDNlYS05ZTA4LTlmNmZlZTI1NWZlMCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjM2ZmZlNDllLTNjOWQtMmY0Yi05ZDZmLWY2MzMxNmFiNmM0YyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjU5MWI0MzI2LThiNmEtNDE3ZS05ZGUzLWVkYmZjMGM3NzczNSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTkxYjQzMjYtOGI2YS00MTdlLTlkZTMtZWRiZmMwYzc3NzM1IiBzdEV2dDp3aGVuPSIyMDIxLTA2LTIwVDEyOjM5OjUyLTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjRmYjJlYTYtODNiMi00MTI0LWJmMWEtZDIxNTcxYjM2ZjUyIiBzdEV2dDp3aGVuPSIyMDIxLTA2LTIwVDEyOjQyOjE4LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTI0Zjg3MDAtMTliMi00M2VhLTllMDgtOWY2ZmVlMjU1ZmUwIiBzdEV2dDp3aGVuPSIyMDIxLTA2LTIwVDE3OjM4OjA4LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4/aTDZ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'

export let lweth_data =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAABYlAAAWJQFJUiTwAAAGuGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDYtMjBUMTI6Mzk6NTItMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA2LTIwVDE3OjM4OjA3LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA2LTIwVDE3OjM4OjA3LTA0OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg4Y2YwYWRjLTY0YmItNDhjYy1iOWM3LTc3NDhhNThiNzk5ZCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OTFiNDMyNi04YjZhLTQxN2UtOWRlMy1lZGJmYzBjNzc3MzUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo1OTFiNDMyNi04YjZhLTQxN2UtOWRlMy1lZGJmYzBjNzc3MzUiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5MWI0MzI2LThiNmEtNDE3ZS05ZGUzLWVkYmZjMGM3NzczNSIgc3RFdnQ6d2hlbj0iMjAyMS0wNi0yMFQxMjozOTo1Mi0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmYxMGU5MTEzLWM2ODUtNDE5OS04MTgzLWViZDdmNGZmOGM0MCIgc3RFdnQ6d2hlbj0iMjAyMS0wNi0yMFQxNzozNToxOS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg4Y2YwYWRjLTY0YmItNDhjYy1iOWM3LTc3NDhhNThiNzk5ZCIgc3RFdnQ6d2hlbj0iMjAyMS0wNi0yMFQxNzozODowNy0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+um+MQAAAN91JREFUeJzNvXe8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'