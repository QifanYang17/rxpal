import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT, tArray } from '../../utils/i18n'
import './box-scan.scss'

const TIME_SLOTS = [
  { key: 'morning', time: '08:00', emoji: '🌅' },
  { key: 'noon', time: '12:00', emoji: '🌤' },
  { key: 'evening', time: '18:00', emoji: '🌇' },
  { key: 'night', time: '21:00', emoji: '🌙' },
]

type Stage = 'capture' | 'loading' | 'result'

interface BoxResult {
  name: string
  dosage: string
  frequency: string
  times: string[]
  duration: string
  notes: string
}

function getStatusMsg(progress: number): string {
  const statuses = tArray('scan.status')
  if (progress < 20) return statuses[Math.floor(Math.random() * 3)] || ''
  if (progress < 45) return statuses[3 + Math.floor(Math.random() * 4)] || ''
  if (progress < 70) return statuses[7 + Math.floor(Math.random() * 4)] || ''
  if (progress < 90) return statuses[11 + Math.floor(Math.random() * 4)] || ''
  return statuses[15 + Math.floor(Math.random() * 2)] || ''
}

export default function BoxScan() {
  const { addMedication } = useStore()
  const { t, tArray: tA } = useT()
  const [stage, setStage] = useState<Stage>('capture')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [quote, setQuote] = useState('')
  const ocrDoneRef = useRef(false)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [result, setResult] = useState<BoxResult>({
    name: '', dosage: '', frequency: t('medAdd.freq1'),
    times: ['08:00'], duration: '30', notes: '',
  })

  const timeSlotLabels = [t('med.morning'), t('med.noon'), t('med.evening'), t('med.night')]

  const freqOpts = [
    { label: t('medAdd.freq1'), value: t('medAdd.freq1') },
    { label: t('medAdd.freq2'), value: t('medAdd.freq2') },
    { label: t('medAdd.freq3'), value: t('medAdd.freq3') },
  ]

  const startProgressSimulation = useCallback(() => {
    ocrDoneRef.current = false
    setProgress(0)
    const quotes = tA('scan.quotes')
    setQuote(quotes[Math.floor(Math.random() * quotes.length)] || '')
    setStatusMsg(getStatusMsg(0))

    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (ocrDoneRef.current) {
          if (prev >= 100) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current)
            return 100
          }
          return Math.min(prev + 5, 100)
        }
        if (prev < 30) return prev + 1.5
        if (prev < 60) return prev + 0.8
        if (prev < 80) return prev + 0.3
        if (prev < 85) return prev + 0.1
        return prev
      })
    }, 200)
  }, [])

  useEffect(() => {
    if (stage !== 'loading') return
    setStatusMsg(getStatusMsg(progress))
  }, [Math.floor(progress / 10), stage])

  useEffect(() => {
    if (stage !== 'loading' && progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [stage])

  const toggleTime = (time: string) => {
    setResult(prev => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter(t => t !== time)
        : [...prev.times, time],
    }))
  }

  const chooseImage = (sourceType: 'camera' | 'album') => {
    Taro.chooseImage({
      count: 1,
      sourceType: [sourceType],
      success: async (res) => {
        setStage('loading')
        startProgressSimulation()
        const filePath = res.tempFilePaths[0]

        try {
          if (!Taro.cloud) throw new Error('Cloud not initialized')
          const uploadRes = await Taro.cloud.uploadFile({
            cloudPath: `ocr/${Date.now()}.jpg`,
            filePath,
          })

          const { result: ocrResult } = await Taro.cloud.callFunction({
            name: 'ocr',
            data: { fileID: uploadRes.fileID, mode: 'box' },
          }) as any

          if (ocrResult?.success && ocrResult.parsed) {
            const p = ocrResult.parsed
            setResult({
              name: p.name || '',
              dosage: p.dosage || '',
              frequency: p.frequency || t('medAdd.freq1'),
              times: p.times || ['08:00'],
              duration: p.duration || '30',
              notes: p.notes || '',
            })
          } else {
            setResult({
              name: '', dosage: '', frequency: t('medAdd.freq1'),
              times: ['08:00'], duration: '30', notes: '',
            })
            Taro.showToast({ title: t('boxScan.ocrFail'), icon: 'none', duration: 2000 })
          }
          ocrDoneRef.current = true
          await new Promise((resolve) => setTimeout(resolve, 800))
          setStage('result')
        } catch (err) {
          console.error('Box OCR error:', err)
          ocrDoneRef.current = true
          await new Promise((resolve) => setTimeout(resolve, 800))
          setResult({
            name: '', dosage: '', frequency: t('medAdd.freq1'),
            times: ['08:00'], duration: '30', notes: '',
          })
          setStage('result')
          Taro.showToast({ title: t('boxScan.cloudFail'), icon: 'none', duration: 2000 })
        }
      },
    })
  }

  const handleSave = () => {
    if (!result.name.trim()) {
      Taro.showToast({ title: t('medAdd.nameRequired'), icon: 'none' })
      return
    }

    addMedication({
      id: `med-box-${Date.now()}`,
      name: result.name.trim(),
      dosage: result.dosage || '1',
      frequency: result.frequency,
      times: result.times.length > 0 ? result.times.sort() : ['08:00'],
      duration: result.duration,
      remainingDays: parseInt(result.duration) || 30,
      notes: result.notes,
      active: true,
    })

    Taro.showToast({ title: t('boxScan.saved'), icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  return (
    <View className='box-scan'>
      {/* CAPTURE */}
      {stage === 'capture' && (
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <View className='viewfinder'>
            <View className='viewfinder-inner'>
              <View className='viewfinder-icon-wrap'>
                <Text>💊</Text>
              </View>
              <Text className='viewfinder-hint'>{t('boxScan.hint')}</Text>
            </View>
          </View>

          <View className='actions'>
            <View className='actions-btn actions-primary' onClick={() => chooseImage('camera')}>
              <Text>📷</Text>
              <Text>{t('boxScan.camera')}</Text>
            </View>
            <View className='actions-btn actions-secondary' onClick={() => chooseImage('album')}>
              <Text>🖼</Text>
              <Text>{t('boxScan.album')}</Text>
            </View>
          </View>

          <Text className='scan-tip'>{t('boxScan.tip')}</Text>
        </View>
      )}

      {/* LOADING */}
      {stage === 'loading' && (
        <View className='loading'>
          <View className='loading-spinner-wrap'>
            <Text className='loading-spinner'>⏳</Text>
            <View className='loading-badge'>
              <Text>✨</Text>
            </View>
          </View>
          <Text className='loading-pct'>{Math.round(progress)}%</Text>
          <Text className='loading-text'>{statusMsg}</Text>
          <View className='loading-bar-wrap'>
            <View className='loading-bar' style={{ width: `${progress}%` }} />
          </View>
          <View className='loading-quote-wrap'>
            <Text className='loading-quote-icon'>💡</Text>
            <Text className='loading-quote'>{quote}</Text>
          </View>
        </View>
      )}

      {/* RESULT */}
      {stage === 'result' && (
        <View className='result'>
          <View className='result-banner'>
            <Text className='result-banner-icon'>✅</Text>
            <Text className='result-banner-text'>{t('boxScan.resultBanner')}</Text>
          </View>

          <View className='form-card'>
            {/* Drug name */}
            <View className='form-field'>
              <Text className='form-label'>{t('medAdd.name')}</Text>
              <Input
                className='form-input'
                placeholder={t('medAdd.namePlaceholder')}
                value={result.name}
                onInput={(e) => setResult(p => ({ ...p, name: e.detail.value }))}
              />
            </View>

            {/* Dosage */}
            <View className='form-field'>
              <Text className='form-label'>{t('medAdd.dosage')}</Text>
              <Input
                className='form-input'
                placeholder={t('medAdd.dosagePlaceholder')}
                value={result.dosage}
                onInput={(e) => setResult(p => ({ ...p, dosage: e.detail.value }))}
              />
            </View>

            {/* Frequency */}
            <View className='form-field'>
              <Text className='form-label'>{t('medAdd.frequency')}</Text>
              <View className='freq-row'>
                {freqOpts.map(o => (
                  <View
                    key={o.value}
                    className={`freq-btn ${result.frequency === o.value ? 'freq-btn-active' : ''}`}
                    onClick={() => setResult(p => ({ ...p, frequency: o.value }))}
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
                    className={`time-btn ${result.times.includes(slot.time) ? 'time-btn-active' : ''}`}
                    onClick={() => toggleTime(slot.time)}
                  >
                    <Text className='time-btn-emoji'>{slot.emoji}</Text>
                    <Text className='time-btn-label'>{timeSlotLabels[idx]}</Text>
                    <Text className='time-btn-time'>{slot.time}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className='form-field'>
              <Text className='form-label'>{t('medAdd.notes')}</Text>
              <Input
                className='form-input'
                placeholder={t('medAdd.notesPlaceholder')}
                value={result.notes}
                onInput={(e) => setResult(p => ({ ...p, notes: e.detail.value }))}
              />
            </View>
          </View>

          <View className='save-btn' onClick={handleSave}>
            <Text>✅</Text>
            <Text>{t('boxScan.save')}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
