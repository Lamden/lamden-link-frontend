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
        interop: ['binance'],
        clearingHouse: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "1.0.3", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_lamden_link_v1", // Will never change
            networkType: "mainnet", // other option is 'mainnet' 
        },
        tokens: {
            binance: [
                {
                    name: "Lamden",
                    symbol: 'TAU',
                    address: 'currency',
                    lamden_clearinghouse: 'con_tau_bridge_v2',
                    origin_lamden: true
                },
                {
                    name: "Lamden USD",
                    symbol: 'LUSD',
                    equivalents: {
                        binance:['USDC']
                    },
                    address: 'con_lusd_lst001',
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }
            ]
        },
        networkName: "Lamden Mainnet",
        network_symbol: "TAU",
        currentStampRatio: 169,
        stamps: {
            burn: 65,
            approval: 65
        }
    },
    binance: {
        network: "wss://ws-nd-240-845-842.p2pify.com/4f418ee905ac8b6effbaa5fad89cd133",
        interop: ['lamden'],
        blockexplorer: "https://bscscan.com",
        blockexplorer_tx: "tx",
        blockexplorer_address: "address",
        network_symbol: "BNB",
        chainId: 56,
        networkName: "Binance Smart Chain Mainnet",
        clearingHouse: {
            address: '0x7F15E7c3Dff596291727F1ba46E98D5DE0697e3d',
            abi: 'clearinghouse_abi'
        },
        tokens: {
            lamden:[{
                name: "Lamden Mainnet Token",
                symbol: 'TAU',
                address: '0x70d7109D3AfE13EE8f9015566272838519578c6b',
                decimals: 18,
                lamden_clearinghouse: 'direct',
                clearingHouse: {
                    address: '0x46E126489b7965ecC13E58f72F6D14B140614C18',
                    abi: 'twb_clearinghouse_abi'
                },
                origin_lamden: true
            },
            {
                name: "BEP-20 USDC",
                symbol: 'USDC',
                lamden_equivalent: 'LUSD',
                address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                decimals: 18,
                lamden_clearinghouse: 'con_lamden_link_bsc_v1'
            }
        ]}
    }
}

export const testnet = {
    lamden: {
        apiLink: "https://testnet.lamden.io/api",
        blockexplorer: "https://testnet.lamden.io",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        interop: ['binance'],
        clearingHouse: {
            appName: "Lamden Link", // Your DAPPS's name
            version: "5.0.3", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_eth_bridge_v2", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
        },
        tokens: {
            binance: [
                {
                    name: "Lamden Testnet Token",
                    symbol: 'dTAU',
                    address: 'currency',
                    lamden_clearinghouse: 'con_tau_bridge_v2',
                    origin_lamden: true
                },
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
                },
                {
                    name: "Lamden USD",
                    symbol: 'LUSD',
                    equivalents: {
                        binance:['USDT']
                    },
                    address: 'con_usdt_bsc_lst001',
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
                    lamden_clearinghouse: 'direct',
                    clearingHouse: {
                        address: '0xaFbE462de48D0B4162536E0b4281A8e0Fb4B524a',
                        abi: 'twb_clearinghouse_abi'
                    },
                    origin_lamden: true
                },
                {
                    name: "BEP-20 USDT",
                    symbol: 'USDT',
                    lamden_equivalent: 'LUSD',
                    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
                    decimals: 18,
                    lamden_clearinghouse: 'con_lamden_link_bsc_v1'
                }
            ]
        }
    }
}