import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'

export const lamdenWalletInfo = writable(undefined);
export const tauBalance = writable(new BN(0));
export const ethBalance = writable(new BN(0));
export const currentNetwork = writable('mainnet');
export const lamden_origin = writable(false)
export const token_selected = writable(null)
export const tokenBalance = writable(null)
export const popup_modal = writable(null)
export const eth_token_balance = writable(null)
export const lamden_token_balance = writable(null)
export const checkTokenBalanceFunction = writable(null)
export const lwc = writable(null)
export const connected_lwc = writable(false)
export const vk = derived(lamdenWalletInfo, ($lamdenWalletInfo) => {
  if (
    $lamdenWalletInfo &&
    $lamdenWalletInfo.wallets &&
    $lamdenWalletInfo.wallets.length > 0
  ) {
    return $lamdenWalletInfo.wallets[0];
  } else {
    return undefined;
  }
});

export const lamdenApprovalTxHash = writable({hash: '', success: false})
export const lamdenBurnTxHash = writable({hash: '', success: false})
export const ethTxHash = writable({hash: '', success: false})
export const resume_burn = writable(false)

export const ethApprovalTxHash = writable({hash: '', success: false})
export const ethDepositTxHash = writable({hash: '', success: false})

export const message = writable("")
export const success = writable("")
export const status = writable("")
export const isLoading = writable(false)