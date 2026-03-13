import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT } from '../../utils/i18n'
import './add.scss'

const TIME_SLOTS = [
  { key: 'morning', time: '08:00', emoji: '🌅' },
  { key: 'noon', time: '12:00', emoji: '🌤' },
  { key: 'evening', time: '18:00', emoji: '🌇' },
  { key: 'night', time: '21:00', emoji: '🌙' },
]

const DOSAGE_PRESETS = ['5mg', '10mg', '25mg', '50mg', '100mg', '500mg']
const DURATION_PRESETS = ['7', '14', '30']

export default function MedicationAdd() {
  const { addMedication } = useStore()
  const { t } = useT()

  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState(t('medAdd.freq1'))
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00'])
  const [duration, setDuration] = useState('30')
  const [isLongTerm, setIsLongTerm] = useState(false)
  const [notes, setNotes] = useState('')

  const freqOpts = [
    { label: t('medAdd.freq1'), value: t('medAdd.freq1') },
    { label: t('medAdd.freq2'), value: t('medAdd.freq2') },
    { label: t('medAdd.freq3'), value: t('medAdd.freq3') },
  ]

  const timeSlotLabels = [t('med.morning'), t('med.noon'), t('med.evening'), t('med.night')]

  const toggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: t('medAdd.nameRequired'), icon: 'none' })
      return
    }

    addMedication({
      id: `med-manual-${Date.now()}`,
      name: name.trim(),
      dosage: dosage || '1',
      frequency,
      times: selectedTimes.length > 0 ? selectedTimes.sort() : ['08:00'],
      duration: isLongTerm ? t('medAdd.longTerm') : `${duration}${t('med.days', { n: '' }).replace(/\s/g, '')}`,
      remainingDays: isLongTerm ? 999 : parseInt(duration) || 30,
      notes,
      active: true,
    })

    Taro.showToast({ title: t('timeline.saved'), icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  return (
    <View className='med-add'>
      <View className='page-title'>
        <Text className='page-title-icon'>💊</Text>
        <Text className='page-title-text'>{t('medAdd.title')}</Text>
      </View>

      <View className='form-card'>
        {/* Drug name */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.name')}</Text>
          <Input
            className='form-input'
            placeholder={t('medAdd.namePlaceholder')}
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        {/* Dosage */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.dosage')}</Text>
          <Input
            className='form-input'
            placeholder={t('medAdd.dosagePlaceholder')}
            value={dosage}
            onInput={(e) => setDosage(e.detail.value)}
          />
          <View className='preset-row'>
            {DOSAGE_PRESETS.map(d => (
              <View
                key={d}
                className={`preset-btn ${dosage === d ? 'preset-btn-active' : ''}`}
                onClick={() => setDosage(d)}
              >
                <Text>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.frequency')}</Text>
          <View className='freq-row'>
            {freqOpts.map(o => (
              <View
                key={o.value}
                className={`freq-btn ${frequency === o.value ? 'freq-btn-active' : ''}`}
                onClick={() => setFrequency(o.value)}
              >
                <Text>{o.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Time slots */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.time')}</Text>
          <View className='time-row'>
            {TIME_SLOTS.map((slot, idx) => (
              <View
                key={slot.key}
                className={`time-btn ${selectedTimes.includes(slot.time) ? 'time-btn-active' : ''}`}
                onClick={() => toggleTime(slot.time)}
              >
                <Text className='time-btn-emoji'>{slot.emoji}</Text>
                <Text className='time-btn-label'>{timeSlotLabels[idx]}</Text>
                <Text className='time-btn-time'>{slot.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.duration')}</Text>
          <View className='duration-row'>
            {DURATION_PRESETS.map(d => (
              <View
                key={d}
                className={`preset-btn ${!isLongTerm && duration === d ? 'preset-btn-active' : ''}`}
                onClick={() => { setDuration(d); setIsLongTerm(false) }}
              >
                <Text>{t('med.days', { n: d })}</Text>
              </View>
            ))}
            <View
              className={`preset-btn ${isLongTerm ? 'preset-btn-active' : ''}`}
              onClick={() => setIsLongTerm(true)}
            >
              <Text>{t('medAdd.longTerm')}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View className='form-field'>
          <Text className='form-label'>{t('medAdd.notes')}</Text>
          <Input
            className='form-input'
            placeholder={t('medAdd.notesPlaceholder')}
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>
      </View>

      <View className='save-btn' onClick={handleSave}>
        <Text>✅</Text>
        <Text>{t('medAdd.save')}</Text>
      </View>
    </View>
  )
}
