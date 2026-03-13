import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT } from '../../utils/i18n'
import './index.scss'

export default function Onboarding() {
  const { updateProfile, setLang, lang } = useStore()
  const { t } = useT()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [avatar, setAvatar] = useState('👴')

  const avatarOpts = [
    { emoji: '👴', label: t('ob.avatar.grandpa') },
    { emoji: '👵', label: t('ob.avatar.grandma') },
    { emoji: '👨', label: t('ob.avatar.male') },
    { emoji: '👩', label: t('ob.avatar.female') },
  ]

  const handleComplete = () => {
    const ageNum = parseInt(age) || 70
    updateProfile({ name: name || t('ob.defaultName'), age: ageNum, avatar })
    Taro.setStorageSync('onboarding_complete', 'true')
    Taro.setStorageSync('show_tutorial', 'true')
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className='onboarding'>
      <View className='ob-dots'>
        {[0, 1, 2].map((i) => (
          <View key={i} className={`ob-dot ${step === i ? 'ob-dot-active' : step > i ? 'ob-dot-done' : ''}`} />
        ))}
      </View>

      {/* Step 0: Welcome + Language */}
      {step === 0 && (
        <View className='ob-step'>
          <View className='ob-hero'>
            <Text className='ob-hero-emoji'>🌿</Text>
          </View>
          <Text className='ob-title'>{t('ob.welcome')}</Text>
          <Text className='ob-subtitle'>{t('ob.welcomeDesc')}</Text>

          <View className='ob-lang'>
            <Text className='ob-field-label'>{t('ob.langLabel')}</Text>
            <View className='ob-lang-options'>
              <View
                className={`ob-lang-btn ${lang === 'zh' ? 'ob-lang-btn-active' : ''}`}
                onClick={() => setLang('zh')}
              >
                <Text>中文</Text>
              </View>
              <View
                className={`ob-lang-btn ${lang === 'en' ? 'ob-lang-btn-active' : ''}`}
                onClick={() => setLang('en')}
              >
                <Text>English</Text>
              </View>
            </View>
          </View>

          <View className='ob-features'>
            <View className='ob-feature'>
              <Text className='ob-feature-icon'>📷</Text>
              <Text className='ob-feature-text'>{t('ob.feature.scan')}</Text>
            </View>
            <View className='ob-feature'>
              <Text className='ob-feature-icon'>💊</Text>
              <Text className='ob-feature-text'>{t('ob.feature.med')}</Text>
            </View>
            <View className='ob-feature'>
              <Text className='ob-feature-icon'>📊</Text>
              <Text className='ob-feature-text'>{t('ob.feature.trend')}</Text>
            </View>
            <View className='ob-feature'>
              <Text className='ob-feature-icon'>👨‍👩‍👧</Text>
              <Text className='ob-feature-text'>{t('ob.feature.family')}</Text>
            </View>
          </View>
          <View className='ob-actions'>
            <View className='ob-btn' onClick={() => setStep(1)}>
              <Text>{t('ob.start')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <View className='ob-step'>
          <View className='ob-hero'>
            <Text className='ob-hero-emoji'>✏️</Text>
          </View>
          <Text className='ob-title'>{t('ob.setupProfile')}</Text>
          <Text className='ob-subtitle'>{t('ob.setupDesc')}</Text>

          <View className='ob-form'>
            <View className='ob-field'>
              <Text className='ob-field-label'>{t('ob.nameLabel')}</Text>
              <Input
                className='ob-field-input'
                placeholder={t('ob.namePlaceholder')}
                value={name}
                onInput={(e) => setName(e.detail.value)}
              />
            </View>
            <View className='ob-field'>
              <Text className='ob-field-label'>{t('ob.ageLabel')}</Text>
              <Input
                className='ob-field-input'
                placeholder={t('ob.agePlaceholder')}
                type='number'
                value={age}
                onInput={(e) => setAge(e.detail.value)}
              />
            </View>
            <View className='ob-field'>
              <Text className='ob-field-label'>{t('ob.avatarLabel')}</Text>
              <View className='ob-avatar-grid'>
                {avatarOpts.map((a) => (
                  <View
                    key={a.emoji}
                    className={`ob-avatar-opt ${avatar === a.emoji ? 'ob-avatar-opt-active' : ''}`}
                    onClick={() => setAvatar(a.emoji)}
                  >
                    <Text className='ob-avatar-emoji'>{a.emoji}</Text>
                    <Text className='ob-avatar-label'>{a.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className='ob-actions'>
            <View className='ob-btn-secondary' onClick={() => setStep(0)}>
              <Text>{t('ob.prev')}</Text>
            </View>
            <View className='ob-btn' onClick={() => setStep(2)}>
              <Text>{t('ob.next')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Step 2: Done */}
      {step === 2 && (
        <View className='ob-step'>
          <View className='ob-hero ob-hero-celebrate'>
            <Text className='ob-hero-emoji'>🎉</Text>
          </View>
          <Text className='ob-title'>{t('ob.done')}</Text>
          <Text className='ob-subtitle'>{t('ob.ready')}</Text>

          <View className='ob-summary'>
            <View className='ob-summary-avatar'>
              <Text>{avatar}</Text>
            </View>
            <Text className='ob-summary-name'>{name || t('ob.defaultName')}</Text>
            <Text className='ob-summary-age'>{t('date.age', { n: age || '70' })}</Text>
          </View>

          <Text className='ob-hint'>{t('ob.tutorialHint')}</Text>

          <View className='ob-actions'>
            <View className='ob-btn-secondary' onClick={() => setStep(1)}>
              <Text>{t('ob.goBack')}</Text>
            </View>
            <View className='ob-btn' onClick={handleComplete}>
              <Text>{t('ob.enter')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
