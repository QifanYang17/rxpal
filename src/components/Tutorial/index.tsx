import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useT } from '../../utils/i18n'
import './index.scss'

interface TutorialProps {
  visible: boolean
  onClose: () => void
}

export default function Tutorial({ visible, onClose }: TutorialProps) {
  const { t } = useT()
  const [step, setStep] = useState(0)

  const STEPS = [
    { emoji: '🏠', title: t('tutorial.home.title'), desc: t('tutorial.home.desc') },
    { emoji: '🕐', title: t('tutorial.timeline.title'), desc: t('tutorial.timeline.desc') },
    { emoji: '📷', title: t('tutorial.scan.title'), desc: t('tutorial.scan.desc') },
    { emoji: '💊', title: t('tutorial.med.title'), desc: t('tutorial.med.desc') },
    { emoji: '👤', title: t('tutorial.profile.title'), desc: t('tutorial.profile.desc') },
  ]

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <View className='tutorial-mask'>
      <View className='tutorial-card'>
        <View className='tutorial-step-badge'>
          <Text>{step + 1}/{STEPS.length}</Text>
        </View>

        <View className='tutorial-emoji-wrap'>
          <Text className='tutorial-emoji'>{current.emoji}</Text>
        </View>

        <Text className='tutorial-title'>{current.title}</Text>
        <Text className='tutorial-desc'>{current.desc}</Text>

        <View className='tutorial-dots'>
          {STEPS.map((_, i) => (
            <View key={i} className={`tutorial-dot ${i === step ? 'tutorial-dot-active' : i < step ? 'tutorial-dot-done' : ''}`} />
          ))}
        </View>

        <View className='tutorial-actions'>
          {step > 0 && (
            <View className='tutorial-btn-prev' onClick={() => setStep(step - 1)}>
              <Text>{t('tutorial.prev')}</Text>
            </View>
          )}
          <View className='tutorial-btn-next' onClick={handleNext}>
            <Text>{isLast ? t('tutorial.start') : t('tutorial.next')}</Text>
          </View>
        </View>

        <View className='tutorial-skip' onClick={onClose}>
          <Text className='tutorial-skip-text'>{t('tutorial.skip')}</Text>
        </View>
      </View>
    </View>
  )
}
