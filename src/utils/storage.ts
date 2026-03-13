import Taro from '@tarojs/taro'
import type { StateStorage } from 'zustand/middleware'

export const taroStorage: StateStorage = {
  getItem: (name) => {
    const value = Taro.getStorageSync(name)
    return value || null
  },
  setItem: (name, value) => {
    Taro.setStorageSync(name, value)
  },
  removeItem: (name) => {
    Taro.removeStorageSync(name)
  },
}
