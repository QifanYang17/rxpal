import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT } from '../../utils/i18n'
import './index.scss'

type Tab = 'list' | 'schedule'

function getColorKey(days: number) {
  if (days < 7) return 'coral'
  if (days < 14) return 'amber'
  return 'sage'
}

function getCurrentSlotIdx() {
  const h = new Date().getHours()
  if (h < 10) return 0
  if (h < 15) return 1
  if (h < 20) return 2
  return 3
}

export default function Medication() {
  const { medications } = useStore()
  const { t } = useT()
  const [tab, setTab] = useState<Tab>('list')
  const [currentSlotIdx, setCurrentSlotIdx] = useState(getCurrentSlotIdx)
  const activeMeds = medications.filter(m => m.active)

  const timeSlots = [
    { key: 'morning', label: t('med.morning'), time: '08:00', emoji: '🌅' },
    { key: 'noon', label: t('med.noon'), time: '12:00', emoji: '🌤' },
    { key: 'evening', label: t('med.evening'), time: '18:00', emoji: '🌇' },
    { key: 'night', label: t('med.night'), time: '21:00', emoji: '🌙' },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlotIdx(getCurrentSlotIdx()), 60000)
    return () => clearInterval(timer)
  }, [])

  function getMedsForSlot(slotTime: string) {
    return activeMeds.filter(med =>
      med.times.some(tm => {
        const mh = parseInt(tm.split(':')[0])
        const sh = parseInt(slotTime.split(':')[0])
        return Math.abs(mh - sh) <= 1
      })
    )
  }

  return (
    <View className='medication'>
      <View className='page-title'>
        <Text className='page-title-icon'>💊</Text>
        <Text className='page-title-text'>{t('med.title')}</Text>
      </View>

      {/* Action buttons */}
      <View className='med-actions'>
        <View className='med-action-btn med-action-scan' onClick={() => Taro.navigateTo({ url: '/pages/medication/box-scan' })}>
          <Text className='med-action-icon'>📷</Text>
          <Text className='med-action-text'>{t('med.scanBox')}</Text>
        </View>
        <View className='med-action-btn med-action-add' onClick={() => Taro.navigateTo({ url: '/pages/medication/add' })}>
          <Text className='med-action-icon'>✏️</Text>
          <Text className='med-action-text'>{t('med.manualAdd')}</Text>
        </View>
      </View>

      <View className='tab-bar'>
        <View className={`tab-btn ${tab === 'list' ? 'tab-btn-active' : ''}`} onClick={() => setTab('list')}>
          <Text>{t('med.list')}</Text>
        </View>
        <View className={`tab-btn ${tab === 'schedule' ? 'tab-btn-active' : ''}`} onClick={() => setTab('schedule')}>
          <Text>{t('med.schedule')}</Text>
        </View>
      </View>

      {/* Drug list */}
      {tab === 'list' && (
        <View className='med-list'>
          {activeMeds.map(med => {
            const ck = getColorKey(med.remainingDays)
            const pct = Math.min(med.remainingDays / 30, 1) * 100
            return (
              <View key={med.id} className={`med-card med-card-${ck}`}>
                <View className='med-card-top'>
                  <Text className='med-card-name'>{med.name}</Text>
                  <Text className={`med-card-dosage med-card-dosage-${ck}`}>{med.dosage}</Text>
                </View>
                <View className='med-card-freq'>
                  <Text className='med-card-freq-text'>⏰ {med.frequency}</Text>
                  <Text className='med-card-freq-sep'>|</Text>
                  <View className='med-card-time-tags'>
                    {med.times.map(tm => (
                      <Text key={tm} className='med-card-time-tag'>{tm}</Text>
                    ))}
                  </View>
                </View>
                <View className='med-card-remaining'>
                  <View className='med-card-remaining-header'>
                    <Text className='med-card-remaining-label'>{t('med.remaining')}</Text>
                    <Text className={`med-card-remaining-days med-card-remaining-${ck}`}>
                      {med.remainingDays < 7 ? '⚠️ ' : ''}{t('med.days', { n: med.remainingDays })}
                    </Text>
                  </View>
                  <View className='med-card-bar-wrap'>
                    <View className={`med-card-bar med-card-bar-${ck}`} style={{ width: `${pct}%` }} />
                  </View>
                </View>
                {med.notes && <Text className='med-card-notes'>{med.notes}</Text>}
              </View>
            )
          })}
        </View>
      )}

      {/* Schedule */}
      {tab === 'schedule' && (
        <View className='schedule'>
          <View className='schedule-line' />
          {timeSlots.map((slot, idx) => {
            const meds = getMedsForSlot(slot.time)
            const isCurrent = idx === currentSlotIdx
            const isPast = idx < currentSlotIdx

            return (
              <View key={slot.key} className='slot'>
                <View className={`slot-dot ${isCurrent ? 'slot-dot-current' : isPast ? 'slot-dot-past' : 'slot-dot-future'}`}>
                  <View className='slot-dot-inner' />
                </View>
                <View className={`slot-card ${isCurrent ? 'slot-card-current' : ''}`}>
                  <View className='slot-header'>
                    <Text className='slot-emoji'>{slot.emoji}</Text>
                    <View>
                      <Text className='slot-label'>{slot.label}</Text>
                      <Text className='slot-time'>{slot.time}</Text>
                    </View>
                    {isCurrent && <Text className='slot-now'>{t('med.current')}</Text>}
                  </View>
                  {meds.length > 0 ? (
                    <View className='slot-meds'>
                      {meds.map(med => {
                        const ck = getColorKey(med.remainingDays)
                        return (
                          <View key={med.id} className={`slot-med-item ${isPast ? 'slot-med-item-past' : ''}`}>
                            <View className={`slot-med-icon slot-med-icon-${ck}`}>
                              <Text>💊</Text>
                            </View>
                            <View className='slot-med-info'>
                              <Text className={`slot-med-name ${isPast ? 'slot-med-name-past' : ''}`}>{med.name}</Text>
                              <Text className='slot-med-dosage'>{med.dosage} · {med.notes}</Text>
                            </View>
                            {med.remainingDays < 7 && (
                              <Text className='slot-med-alert'>{t('med.onlyDaysLeft', { n: med.remainingDays })}</Text>
                            )}
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <Text className='slot-empty'>{t('med.noMeds')}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}
