import { writable } from 'svelte/store';

export const ethToLamdenStore = writable(true);

// Results Trackers
export const withdrawTxStatus = writable({})