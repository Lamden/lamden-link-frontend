import * as clearinghouse_abi from './clearinghouse_abi.js'

/*
    BDT Mainnet info
    {
        name: 'BDT',
        address: '0x7BCe667EF12023dc5f8577D015a2F09d99a5ef58',
        decimals: 18
    }
*/

export const mainnet = {
    lamden: {
        apiLink: "https://mainnet.lamden.io/api",
        blockexplorer: "https://www.tauhq.com",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        interop: ['ethereum'],
        clearingHouse: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "1.0.3", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_lamden_link_v1", // Will never change
            networkType: "mainnet", // other option is 'mainnet' 
        },
        tokens: {
            ethereum:[{
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: 'con_weth_lst001',
                lamden_clearinghouse: 'con_lamden_link_v1'
                
            }],
            binance: [{
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: 'con_bdt_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
            }]
        },
        networkName: "Lamden Mainnet",
        network_symbol: "TAU",
        currentStampRatio: 65,
        stamps: {
            burn: 65,
            approval: 65
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
        clearingHouse: {
            address: '0xF881aC8E0BAe5FCFE125e88c5F90A693aF3EA8Cb',
            abi: clearinghouse_abi.abi
        },
        tokens: {
            lamden:[{
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                decimals: 18,
                lamden_clearinghouse: 'con_lamden_link_v1'
            }]
        }
    },
    binance: {
        network: "wss://ws-nd-463-770-272.p2pify.com/8411e4e71f588f5c0b80b936d3081378",
        interop: ['lamden'],
        blockexplorer: "https://bscscan.com",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        network_symbol: "BNB",
        chainId: 56,
        networkName: "Binance Smart Chain Mainnet",
        clearingHouse: {
            address: '0x7F15E7c3Dff596291727F1ba46E98D5DE0697e3d',
            abi: clearinghouse_abi.abi
        },
        tokens: {
            lamden:[{
                name: "Lamden Mainnet Token",
                symbol: 'TAU',
                address: '0xdFa3b0019EcF48c753B58908B5A21d11641bA56f',
                decimals: 18,
                lamden_clearinghouse: 'direct'
            },
            {
                name: "Block Duelers",
                symbol: 'BDT',
                address: '0x286a61a9b193f1b92d3a0fab4fd16028786273f3',
                decimals: 18,
                lamden_clearinghouse: 'con_lamden_link_bsc_v1'
            }]
        }
    }
}

export const testnet = {
    lamden: {
        apiLink: "https://testnet.lamden.io/api",
        blockexplorer: "https://testnet.lamden.io",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        interop: ['ethereum', 'binance'],
        clearingHouse: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "5.0.3", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_eth_bridge_v2", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
        },
        tokens: {
            ethereum:[
                {
                    name: "Wrapped Ethereum",
                    symbol: 'WETH',
                    address: 'con_weth_lst001_v1',
                    lamden_clearinghouse: 'con_eth_bridge_v2'
                }
            ],
            binance: [
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: 'con_bdt_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }
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
            abi: clearinghouse_abi.abi
        },
        tokens: {
            lamden: [{
                name: "Wrapped Ethereum",
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
                lamden_clearinghouse: 'con_eth_bridge_v2'
            }]
        }
    },
    binance: {
        network: "wss://ws-nd-088-476-707.p2pify.com/04675114bb8fa340f6c15f995fe3c367",
        interop: ['lamden'],
        blockexplorer: "https://testnet.bscscan.com",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        network_symbol: "TBNB",
        chainId: 97,
        networkName: "Binance Smart Chain Test Network",
        clearingHouse: {
            address: '0xA57dd4494D991840D43df0146f51a0A10A34327f',
            abi: clearinghouse_abi.abi
        },
        tokens: {
            lamden: [
                {
                    name: "Lamden Testnet Token",
                    symbol: 'dTAU',
                    address: '0x14Cdc7f44D497B47c26196Aef2C4f779875b0846',
                    decimals: 18,
                    lamden_clearinghouse: 'direct'
                },
                {
                    name: "Block Duelers",
                    symbol: 'BDT',
                    address: '0x1A023125a11968Ea5685291fBbDF484D98b4E41e',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }
            ]
        }
    }
}