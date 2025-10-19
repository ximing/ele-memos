import { SavedAddress } from '../App'

export interface ElectronAPI {
  getAddresses: () => Promise<SavedAddress[]>
  saveAddresses: (addresses: SavedAddress[]) => Promise<void>
  getLastUsedAddress: () => Promise<string>
  setLastUsedAddress: (address: string) => Promise<void>
  navigateToAddress: (address: string) => Promise<void>
  showAddressInput: () => Promise<void>
  showAddressManager: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
