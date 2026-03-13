import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // 初始化云开发（需要在微信公众平台开通云开发后填入环境 ID）
    if (Taro.cloud) {
      Taro.cloud.init({
        env: 'cloud1-6gwg70jj0b3df427', // 填入你的云开发环境 ID
        traceUser: true,
      })
    }
    // 新用户引导检测
    const onboardingComplete = Taro.getStorageSync('onboarding_complete')
    if (!onboardingComplete) {
      Taro.redirectTo({ url: '/pages/onboarding/index' })
    }
  })

  return children
}

export default App
