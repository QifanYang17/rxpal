import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT, tArray } from '../../utils/i18n'
import type { MedicalRecord } from '../../types'
import './index.scss'

type Stage = 'capture' | 'loading' | 'result'
type DocType = 'record' | 'prescription'

interface OcrResult {
  type: DocType
  patientName: string
  date: string
  hospital: string
  department: string
  doctor: string
  diagnosis: string
  medications: { name: string; dosage: string; frequency: string; duration: string }[]
}

const MOCK_RESULT: OcrResult = {
  type: 'prescription',
  patientName: '王建国',
  date: '2026-03-11',
  hospital: '北京协和医院',
  department: '心内科',
  doctor: '张明主任',
  diagnosis: '高血压2级，需继续规律服药',
  medications: [
    { name: '氨氯地平片', dosage: '5mg', frequency: '每日1次', duration: '30天' },
    { name: '阿司匹林肠溶片', dosage: '100mg', frequency: '每日1次', duration: '30天' },
  ],
}

function getStatusMsg(progress: number): string {
  const statuses = tArray('scan.status')
  if (progress < 20) return statuses[Math.floor(Math.random() * 3)] || ''
  if (progress < 45) return statuses[3 + Math.floor(Math.random() * 4)] || ''
  if (progress < 70) return statuses[7 + Math.floor(Math.random() * 4)] || ''
  if (progress < 90) return statuses[11 + Math.floor(Math.random() * 4)] || ''
  return statuses[15 + Math.floor(Math.random() * 2)] || ''
}

export default function Scan() {
  const addRecord = useStore((s) => s.addRecord)
  const { t, tArray: tA } = useT()
  const [stage, setStage] = useState<Stage>('capture')
  const [result, setResult] = useState<OcrResult>(MOCK_RESULT)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [quote, setQuote] = useState('')
  const ocrDoneRef = useRef(false)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useDidShow(() => {
    setStage('capture')
  })

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
            data: { fileID: uploadRes.fileID },
          }) as any

          if (ocrResult?.success && ocrResult.parsed) {
            const parsed = ocrResult.parsed
            setResult({
              type: parsed.type || 'record',
              patientName: parsed.patientName || '',
              date: parsed.date || new Date().toISOString().split('T')[0],
              hospital: parsed.hospital || '',
              department: parsed.department || '',
              doctor: parsed.doctor || '',
              diagnosis: parsed.diagnosis || '',
              medications: parsed.medications || [],
            })
          } else {
            setResult({
              type: 'record',
              patientName: '',
              date: new Date().toISOString().split('T')[0],
              hospital: '',
              department: '',
              doctor: '',
              diagnosis: '',
              medications: [],
            })
            Taro.showToast({ title: t('scan.ocrFail'), icon: 'none', duration: 2000 })
          }
          ocrDoneRef.current = true
          await new Promise((resolve) => setTimeout(resolve, 800))
          setStage('result')
        } catch (err) {
          console.error('OCR error:', err)
          ocrDoneRef.current = true
          await new Promise((resolve) => setTimeout(resolve, 800))
          setResult({ ...MOCK_RESULT })
          setStage('result')
          Taro.showToast({ title: t('scan.cloudFail'), icon: 'none', duration: 2000 })
        }
      },
    })
  }

  const handleSave = () => {
    const record: MedicalRecord = {
      id: `rec-scan-${Date.now()}`,
      date: result.date,
      hospital: result.hospital,
      department: result.department,
      doctor: result.doctor,
      diagnosis: result.diagnosis,
      details: `${t('scan.autoDetails')}${result.type === 'prescription' ? t('scan.withPrescription') : ''}`,
      prescriptions: result.type === 'prescription'
        ? [{
            id: `rx-scan-${Date.now()}`,
            recordId: `rec-scan-${Date.now()}`,
            medications: result.medications.map((m, i) => ({
              id: `med-scan-${Date.now()}-${i}`,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              times: ['08:00'],
              duration: m.duration,
              remainingDays: parseInt(m.duration) || 30,
              notes: '',
              active: true,
            })),
          }]
        : [],
    }
    addRecord(record)
    Taro.switchTab({ url: '/pages/timeline/index' })
  }

  const updateField = <K extends keyof OcrResult>(key: K, value: OcrResult[K]) => {
    setResult((prev) => ({ ...prev, [key]: value }))
  }

  const updateMed = (idx: number, field: string, value: string) => {
    setResult((prev) => ({
      ...prev,
      medications: prev.medications.map((m, i) =>
        i === idx ? { ...m, [field]: value } : m
      ),
    }))
  }

  const fieldLabels: { label: string; key: keyof OcrResult }[] = [
    { label: t('scan.patientName'), key: 'patientName' },
    { label: t('scan.date'), key: 'date' },
    { label: t('scan.hospital'), key: 'hospital' },
    { label: t('scan.department'), key: 'department' },
    { label: t('scan.doctor'), key: 'doctor' },
    { label: t('scan.diagnosis'), key: 'diagnosis' },
  ]

  return (
    <View className='scan'>
      {/* CAPTURE */}
      {stage === 'capture' && (
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <View className='viewfinder'>
            <View className='viewfinder-inner'>
              <View className='viewfinder-icon-wrap'>
                <Text>📄</Text>
              </View>
              <Text className='viewfinder-hint'>{t('scan.hint')}</Text>
            </View>
          </View>

          <View className='actions'>
            <View className='actions-btn actions-primary' onClick={() => chooseImage('camera')}>
              <Text>📷</Text>
              <Text>{t('scan.camera')}</Text>
            </View>
            <View className='actions-btn actions-secondary' onClick={() => chooseImage('album')}>
              <Text>🖼</Text>
              <Text>{t('scan.album')}</Text>
            </View>
          </View>

          <Text className='scan-tip'>{t('scan.tip')}</Text>
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
            <Text className='result-banner-text'>{t('scan.resultBanner')}</Text>
          </View>

          <View className='type-toggle'>
            <View
              className={`type-toggle-btn ${result.type === 'record' ? 'type-toggle-active' : ''}`}
              onClick={() => updateField('type', 'record')}
            >
              <Text>{t('scan.record')}</Text>
            </View>
            <View
              className={`type-toggle-btn ${result.type === 'prescription' ? 'type-toggle-active' : ''}`}
              onClick={() => updateField('type', 'prescription')}
            >
              <Text>{t('scan.prescription')}</Text>
            </View>
          </View>

          <View className='fields-card'>
            {fieldLabels.map((f) => (
              <View key={f.key} className='field-row'>
                <Text className='field-row-label'>{f.label}</Text>
                <Input
                  className='field-row-input'
                  value={result[f.key] as string}
                  onInput={(e) => updateField(f.key, e.detail.value as any)}
                />
              </View>
            ))}
          </View>

          {result.type === 'prescription' && (
            <View className='meds-section'>
              <View className='meds-section-title'>
                <View className='meds-section-dot' />
                <Text>{t('scan.prescriptionMeds')}</Text>
              </View>
              {result.medications.map((med, idx) => (
                <View key={idx} className='med-card'>
                  <View className='med-card-header'>
                    <View className='med-card-num'>
                      <Text>{idx + 1}</Text>
                    </View>
                    <Input
                      className='med-card-name-input'
                      value={med.name}
                      onInput={(e) => updateMed(idx, 'name', e.detail.value)}
                    />
                  </View>
                  <View className='med-card-fields'>
                    {([
                      { label: t('scan.dosage'), field: 'dosage' },
                      { label: t('scan.frequency'), field: 'frequency' },
                      { label: t('scan.duration'), field: 'duration' },
                    ]).map((f) => (
                      <View key={f.field} className='med-card-field'>
                        <Text className='med-card-field-label'>{f.label}</Text>
                        <Input
                          className='med-card-field-input'
                          value={med[f.field as keyof typeof med]}
                          onInput={(e) => updateMed(idx, f.field, e.detail.value)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className='save-btn' onClick={handleSave}>
            <Text>✅</Text>
            <Text>{t('scan.save')}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
