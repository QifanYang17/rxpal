import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { getGreeting, formatDate } from '../../utils/helpers'
import { useT } from '../../utils/i18n'
import Tutorial from '../../components/Tutorial'
import './index.scss'

export default function Home() {
  const { profile, reminders, records, medications, toggleReminder } = useStore()
  const { t } = useT()

  const [showTutorial, setShowTutorial] = useState(false)

  useDidShow(() => {
    const shouldShow = Taro.getStorageSync('show_tutorial')
    if (shouldShow === 'true') {
      setShowTutorial(true)
    }
  })

  const greeting = getGreeting()
  const medReminders = reminders.filter((r) => r.type === 'medication')
  const doneCount = medReminders.filter((r) => r.done).length
  const totalCount = medReminders.length
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)
  const pendingMeds = new Set(
    medReminders.filter((r) => !r.done && !r.skipped).map((r) => r.medicationId)
  ).size
  const remainingCount = medReminders.filter((r) => !r.done && !r.skipped).length

  const upcoming = reminders
    .filter((r) => !r.done && !r.skipped)
    .sort((a, b) => a.time.localeCompare(b.time))

  const latestRecord = records.length > 0 ? records[0] : null

  return (
    <View className='home'>
      {/* Greeting */}
      <View className='greeting'>
        <View className='greeting-left'>
          <View className='greeting-row'>
            <Text className='greeting-emoji'>{greeting.emoji}</Text>
            <Text className='greeting-name'>{greeting.text}，{profile.name}</Text>
          </View>
          <Text className='greeting-date'>{formatDate()}</Text>
        </View>
        <Text className='greeting-avatar'>{profile.avatar}</Text>
      </View>

      {/* Progress */}
      <View className='progress-card'>
        <Text className='progress-card-title'>{t('home.todayProgress')}</Text>
        <Text className='progress-card-pct'>{pct}%</Text>
        <View className='progress-card-bar-wrap'>
          <View className='progress-card-bar' style={{ width: `${pct}%` }} />
        </View>
        <Text className='progress-card-sub'>{doneCount}/{totalCount} {t('home.completed')}</Text>
      </View>

      {/* Quick Stats */}
      <View className='stats'>
        <View className='stats-item stats-sage'>
          <Text className='stats-icon'>💊</Text>
          <Text className='stats-value'>{t('home.types', { n: pendingMeds })}</Text>
          <Text className='stats-label'>{t('home.pending')}</Text>
        </View>
        <View className='stats-item stats-sky'>
          <Text className='stats-icon'>✅</Text>
          <Text className='stats-value'>{t('home.times', { n: doneCount })}</Text>
          <Text className='stats-label'>{t('home.completed')}</Text>
        </View>
        <View className='stats-item stats-amber'>
          <Text className='stats-icon'>⏰</Text>
          <Text className='stats-value'>{t('home.times', { n: remainingCount })}</Text>
          <Text className='stats-label'>{t('home.remaining')}</Text>
        </View>
      </View>

      {/* Today's Reminders */}
      <View className='section-header'>
        <Text className='section-header-title'>{t('home.todayReminders')}</Text>
        <Text className='section-header-sub'>{t('home.pendingItems', { n: upcoming.length })}</Text>
      </View>

      <View className='reminder-list'>
        {upcoming.length === 0 ? (
          <View className='all-done'>
            <Text className='all-done-icon'>✅</Text>
            <Text className='all-done-text'>{t('home.allDone')}</Text>
          </View>
        ) : (
          upcoming.map((r) => {
            const med = medications.find((m) => m.id === r.medicationId)
            return (
              <View
                key={r.id}
                className='reminder-item'
                onClick={() => toggleReminder(r.id)}
              >
                <View className='reminder-item-time'>
                  <Text className='reminder-item-time-text'>{r.time}</Text>
                  <Text className='reminder-item-time-label'>
                    {r.type === 'sleep' ? t('home.sleep') : t('home.takeMed')}
                  </Text>
                </View>
                <View className='reminder-item-divider' />
                <View className='reminder-item-info'>
                  <Text className='reminder-item-title'>{r.title}</Text>
                  {r.subtitle && (
                    <Text className='reminder-item-subtitle'>{r.subtitle}</Text>
                  )}
                  {med && (
                    <Text className='reminder-item-dosage'>
                      {med.dosage} · {med.frequency}
                    </Text>
                  )}
                </View>
                <View className='reminder-item-check'>
                  <Text>✓</Text>
                </View>
              </View>
            )
          })
        )}
      </View>

      {/* Latest Record */}
      {latestRecord && (
        <View>
          <View className='section-header'>
            <Text className='section-header-title'>{t('home.recentVisit')}</Text>
            <Text
              className='section-header-link'
              onClick={() => Taro.switchTab({ url: '/pages/timeline/index' })}
            >
              {t('home.viewAll')}
            </Text>
          </View>
          <View className='latest-record'>
            <View className='latest-record-date'>
              <Text>🕐</Text>
              <Text>{latestRecord.date}</Text>
            </View>
            <View className='latest-record-hospital'>
              <Text className='latest-record-hospital-icon'>🏥</Text>
              <Text className='latest-record-hospital-name'>{latestRecord.hospital}</Text>
              <Text className='latest-record-hospital-dept'>{latestRecord.department}</Text>
            </View>
            <Text className='latest-record-diagnosis'>{latestRecord.diagnosis}</Text>
          </View>
        </View>
      )}

      {/* Floating Scan Button */}
      <View
        className='fab'
        onClick={() => Taro.switchTab({ url: '/pages/scan/index' })}
      >
        <Text className='fab-icon'>📷</Text>
      </View>

      {/* Tutorial overlay */}
      <Tutorial
        visible={showTutorial}
        onClose={() => {
          setShowTutorial(false)
          Taro.removeStorageSync('show_tutorial')
        }}
      />
    </View>
  )
}
