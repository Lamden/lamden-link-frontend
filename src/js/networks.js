import old_clearinghouse_abi from './abi/old_clearinghouse_abi.js'
import eth_eth_native from './abi/eth_eth_native.js'
import eth_lamden_native from './abi/eth_lamden_native.js'
import lamden_lamden_native from './abi/lamden_lamden_native.js'
import lamden_eth_native from './abi/lamden_eth_native.js'

export const mainnet = {
    bridges: {
        eth_native:{
            lamden_clearinghouse: {
                address: "con_lamden_link_v1",
                abi: lamden_eth_native
            },
            clearingHouse: {
                address: '0xF881aC8E0BAe5FCFE125e88c5F90A693aF3EA8Cb',
                abi: old_clearinghouse_abi,
                depositEvent: "TokensWrapped"
            }
        },
        bsc_native: {
            lamden_clearinghouse: {
                address: "con_bsc_native_tokens_bridge_to_bsc_v1",
                abi: lamden_eth_native
            },
            clearingHouse: {
                address: '0xEEfE1327459525F836100068A50e038f82579bEe',
                abi: eth_eth_native,
                depositEvent: "TokensWrapped"
            }
        },
        lamden_native_to_bsc: {
            origin_lamden: true,
            lamden_clearinghouse: {
                address: "con_lamden_native_tokens_bridge_to_bsc_v1",
                abi: lamden_lamden_native
            },
            clearingHouse: {
                address: '0x12C718eF3Ce17CABD773a40CF6202B635441FA97',
                abi: eth_lamden_native,
                depositEvent: "TokensBurned"
            }
        }
    },
    lamden: {
        apiLink: "https://mainnet.lamden.io/api",
        blockexplorer: "https://arko.tauhq.com",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        interop: ['ethereum', 'binance'],
        walletConnection: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "1.0.3", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_lamden_link_v1", // Will never change
            networkType: "mainnet", // other option is 'mainnet' 
            networkName: 'arko' // New Arko network
        },
        tokens: {
            ethereum:[
                {
                    name: "Wrapped Ethereum",
                    symbol: 'WETH',
                    address: 'con_weth_lst001',
                    bridge: "eth_native"
                }
            ],
            binance: [
                {
                    name: "Lamden",
                    symbol: 'TAU',
                    address: 'currency',
                    bridge: "lamden_native_to_bsc"
                },
                {
                    name: "Lamden USD",
                    symbol: 'LUSD',
                    equivalents: {
                        binance:['BUSD']
                    },
                    address: 'con_lusd_lst001',
                    bridge: "bsc_native"
                }
                /*
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: 'con_bdt_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Duelers Credits",
                    symbol: 'DC',
                    address: 'con_dc_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Liquidus Finance",
                    symbol: 'LIQ',
                    address: 'con_liquidus_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },*/
            ]
        },
        networkName: "Lamden Mainnet",
        network_symbol: "TAU",
        currentStampRatio: 169,
        stamps: {
            burn: 80,
            approval: 80
        }
    },
    ethereum: {
        network: "wss://mainnet.infura.io/ws/v3/5ef3994ede0945f6beb3fbddef483643",
        interop: ['lamden'],
        blockexplorer: "https://etherscan.io",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        chainId: 1,
        networkName: "Ethereum Mainnet",
        network_symbol: "ETH",
        tokens: {
            lamden:[{
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                decimals: 18,
                bridge: "eth_native"
            }]
        }
    },
    binance: {
        //network: "wss://ws-nd-240-845-842.p2pify.com/4f418ee905ac8b6effbaa5fad89cd133",
        network: "wss://ws-nd-463-770-272.p2pify.com/8411e4e71f588f5c0b80b936d3081378",
        interop: ['lamden'],
        blockexplorer: "https://bscscan.com",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        network_symbol: "BNB",
        chainId: 56,
        networkName: "Binance Smart Chain Mainnet",
        tokens: {
            lamden:[
                {
                    name: "Lamden Mainnet Token",
                    symbol: 'TAU',
                    address: '0x5d9Cb4C6F988f8eD166F175a5B8be7E3CBCA850d',
                    decimals: 18,
                    bridge: "lamden_native_to_bsc"
                },
                {
                    name: "Binance-Peg BUSD",
                    symbol: 'BUSD',
                    lamden_equivalent: 'LUSD',
                    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                    decimals: 18,
                    bridge: "bsc_native"
                }
                /*
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: '0x286a61a9B193F1b92d3A0FaB4Fd16028786273f3',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Duelers Credits",
                    symbol: 'DC',
                    address: '0x7990ad6dBE9bCE17Ed91E72B30899b77a415f6CC',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Liquidus Finance",
                    symbol: 'LIQ',
                    address: '0xc7981767f644C7F8e483DAbDc413e8a371b83079',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "BEP-20 USDC",
                    symbol: 'USDC',
                    lamden_equivalent: 'LUSD',
                    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "BEP-20 USDT",
                    symbol: 'USDT',
                    lamden_equivalent: 'LUSD',
                    address: '0x55d398326f99059fF775485246999027B3197955',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }
                */
            ]
        }
    }
}

export const testnet = {
    bridges: {
        eth_native:{
            lamden_clearinghouse: {
                address: "con_eth_native_tokens_bridge_to_eth_v1",
                abi: lamden_eth_native
            },
            clearingHouse: {
                address: '0xa50f39F5b9D0721E0e5bE1B6f89e168d5F468301',
                abi: old_clearinghouse_abi,
                depositEvent: "TokensWrapped"
            }
        },
        bsc_native: {
            lamden_clearinghouse: {
                address: "con_bsc_native_tokens_bridge_to_bsc_v4",
                abi: lamden_eth_native
            },
            clearingHouse: {
                address: '0xa50f39F5b9D0721E0e5bE1B6f89e168d5F468301',
                abi: eth_eth_native,
                depositEvent: "TokensWrapped"
            }
        },
        lamden_native_to_bsc: {
            origin_lamden: true,
            lamden_clearinghouse: {
                address: "con_lamden_native_tokens_bridge_to_bsc_v4",
                abi: lamden_lamden_native
            },
            clearingHouse: {
                address: '0x4dd0EC135dAC004F0C0e5a980120822304dAA23B',
                abi: eth_lamden_native,
                depositEvent: "TokensBurned"
            }
        }
    },
    lamden: {
        apiLink: "https://testnet.lamden.io/api",
        blockexplorer: "https://testnetv2.tauhq.com",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        interop: ['ethereum', 'binance'],
        walletConnection: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "5.0.5", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_lamden_native_tokens_bridge_to_bsc_v4", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
            networkName: 'arko' // New Arko network
        },
        tokens: {
            ethereum:[
                {
                    name: "Wrapped Ethereum",
                    symbol: 'WETH',
                    address: 'con_weth_lst001_v3',
                    bridge: "eth_native"
                }
            ],
            binance: [
                {
                    name: "Lamden Testnet Token",
                    symbol: 'dTAU',
                    address: 'currency',
                    bridge: "lamden_native_to_bsc"
                },
                {
                    name: "Lamden USD",
                    symbol: 'LUSD',
                    equivalents: {
                        binance:['BUSD']
                    },
                    address: 'con_usdt_bsc_lst001',
                    bridge: "bsc_native"
                }/*,
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: 'con_bdt_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Duelers Credits",
                    symbol: 'DC',
                    address: 'con_dc_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Liquidus Finance",
                    symbol: 'LIQ',
                    address: 'con_liquidus_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }*/
            ]
        },
        networkName: "Lamden Testnet",
        network_symbol: "DTAU",
        currentStampRatio: 13,
        stamps: {
            burn: 65,
            approval: 65
        }
    },
    ethereum: {
        network: "wss://kovan.infura.io/ws/v3/63ded85a9a5442c6ae2b94c2e97fb8c4",
        interop: ['lamden'],
        blockexplorer: "https://kovan.etherscan.io",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        network_symbol: "TETH",
        chainId: 42,
        networkName: "Kovan Test Network",
        clearingHouse: {
            address: '0xF69Fae70CC5Af8f3A8DE496Bf06C6bC021baDea0',
            abi: 'clearinghouse_abi'
        },
        tokens: {
            lamden: [{
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
                bridge: "eth_native"
            }]
        }
    },
    binance: {
        network: "https://nd-867-543-091.p2pify.com/3cfe90b4204a0cd275ff8f31f992dbd0",
        interop: ['lamden'],
        blockexplorer: "https://testnet.bscscan.com",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        bsc_scan: {
            api_url: "https://api-testnet.bscscan.com/api?module=logs&action=getLogs",
            key: "7GX2TBH7TB2SIBWBA69E1C9PJ2S69Y7SZE"
        },
        network_symbol: "TBNB",
        chainId: 97,
        networkName: "Binance Smart Chain Test Network",
        clearingHouse: {
            address: '0xA57dd4494D991840D43df0146f51a0A10A34327f',
            abi: 'clearinghouse_abi'
        },
        tokens: {
            lamden: [
                {
                    name: "Lamden Testnet Token",
                    symbol: 'dTAU',
                    address: '0xfdB08de83A90872e4b540b1c0f04Ac8A6654dd88',
                    decimals: 18,
                    bridge: "lamden_native_to_bsc"
                },
                {
                    name: "Binance-Peg BUSD",
                    symbol: 'BUSD',
                    lamden_equivalent: 'LUSD',
                    address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
                    decimals: 18,
                    bridge: "bsc_native"
                }
                /*
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: '0x1A023125a11968Ea5685291fBbDF484D98b4E41e',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Duelers Credits",
                    symbol: 'DC',
                    address: '0x7126Bf8fafa29Eb55B13C2C3956e617aB181ffaa',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "Liquidus Finance",
                    symbol: 'LIQ',
                    address: '0x481E0c66d2cC0bC41AA75D135cC6C7137a5A21EC',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                },
                {
                    name: "BEP-20 USDT",
                    symbol: 'USDT',
                    lamden_equivalent: 'LUSD',
                    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }*/
            ]
        }
    }
}