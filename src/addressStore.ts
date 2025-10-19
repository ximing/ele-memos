import Store from 'electron-store'

export interface SavedAddress {
  id: string
  url: string
  name: string
  lastUsed?: number
}

interface StoreSchema {
  addresses: SavedAddress[]
  lastUsedAddress: string
}

class AddressStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      defaults: {
        addresses: [],
        lastUsedAddress: ''
      }
    })
  }

  getAddresses(): SavedAddress[] {
    return (this.store as any).get('addresses', [])
  }

  saveAddresses(addresses: SavedAddress[]): void {
    (this.store as any).set('addresses', addresses)
  }

  getLastUsedAddress(): string {
    return (this.store as any).get('lastUsedAddress', '')
  }

  setLastUsedAddress(address: string): void {
    (this.store as any).set('lastUsedAddress', address)
  }

  addOrUpdateAddress(url: string, name?: string): SavedAddress {
    const addresses = this.getAddresses()
    const existingIndex = addresses.findIndex(addr => addr.url === url)

    const address: SavedAddress = {
      id: existingIndex >= 0 ? addresses[existingIndex].id : Date.now().toString(),
      url,
      name: name || (existingIndex >= 0 ? addresses[existingIndex].name : new URL(url).hostname),
      lastUsed: Date.now()
    }

    if (existingIndex >= 0) {
      addresses[existingIndex] = address
    } else {
      addresses.push(address)
    }

    this.saveAddresses(addresses)
    this.setLastUsedAddress(url)

    return address
  }

  removeAddress(id: string): void {
    const addresses = this.getAddresses()
    const filteredAddresses = addresses.filter(addr => addr.id !== id)
    this.saveAddresses(filteredAddresses)
  }
}

export default AddressStore
