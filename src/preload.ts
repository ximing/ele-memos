// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { SavedAddress } from './addressStore'

// 为渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 地址管理
  getAddresses: (): Promise<SavedAddress[]> => ipcRenderer.invoke('get-addresses'),
  saveAddresses: (addresses: SavedAddress[]): Promise<void> => ipcRenderer.invoke('save-addresses', addresses),
  getLastUsedAddress: (): Promise<string> => ipcRenderer.invoke('get-last-used-address'),
  setLastUsedAddress: (address: string): Promise<void> => ipcRenderer.invoke('set-last-used-address', address),

  // 导航
  navigateToAddress: (address: string): Promise<void> => ipcRenderer.invoke('navigate-to-address', address),

  // UI控制
  showAddressInput: (): Promise<void> => ipcRenderer.invoke('show-address-input'),
  showAddressManager: (): Promise<void> => ipcRenderer.invoke('show-address-manager'),
})
