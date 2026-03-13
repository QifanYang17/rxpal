import { useState, useEffect } from 'react'
import { View, Text, Canvas, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT } from '../../utils/i18n'
import { formatRecordDate } from '../../utils/helpers'
import type { HealthTrend } from '../../types'
import './index.scss'

type Tab = 'records' | 'trends'
type TrendMetric = 'bloodPressure' | 'bloodSugar' | 'heartRate' | 'weight'

function fmtShortDate(s: string) {
  const d = new Date(s)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Timeline() {
  const { records, healthTrends, addHealthData } = useStore()
  const { t } = useT()
  const [tab, setTab] = useState<Tab>('records')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [metric, setMetric] = useState<TrendMetric>('bloodPressure')
  const [showInput, setShowInput] = useState(false)
  const [inputVals, setInputVals] = useState<Record<string, string>>({})

  const metricChips: { key: TrendMetric; label: string; emoji: string }[] = [
    { key: 'bloodPressure', label: t('timeline.bp'), emoji: '❤️' },
    { key: 'bloodSugar', label: t('timeline.bs'), emoji: '🩸' },
    { key: 'heartRate', label: t('timeline.hr'), emoji: '💓' },
    { key: 'weight', label: t('timeline.wt'), emoji: '⚖️' },
  ]

  const metricConfig: Record<TrendMetric, { unit: string; fields: string[]; labels: string[]; colors: string[] }> = {
    bloodPressure: { unit: 'mmHg', fields: ['bloodPressureSys', 'bloodPressureDia'], labels: [t('timeline.sysBp'), t('timeline.diaBp')], colors: ['#e8886f', '#6ba3c7'] },
    bloodSugar: { unit: 'mmol/L', fields: ['bloodSugar'], labels: [t('timeline.bs')], colors: ['#d4a84b'] },
    heartRate: { unit: 'bpm', fields: ['heartRate'], labels: [t('timeline.hr')], colors: ['#e8886f'] },
    weight: { unit: 'kg', fields: ['weight'], labels: [t('timeline.wt')], colors: ['#6ba3c7'] },
  }

  const refRanges: Record<TrendMetric, string> = {
    bloodPressure: t('timeline.refBp'),
    bloodSugar: t('timeline.refBs'),
    heartRate: t('timeline.refHr'),
    weight: t('timeline.refWt'),
  }

  const inputFields: Record<TrendMetric, { key: string; label: string; placeholder: string }[]> = {
    bloodPressure: [
      { key: 'bloodPressureSys', label: t('timeline.sysBp'), placeholder: t('timeline.bpSysPlaceholder') },
      { key: 'bloodPressureDia', label: t('timeline.diaBp'), placeholder: t('timeline.bpDiaPlaceholder') },
    ],
    bloodSugar: [{ key: 'bloodSugar', label: t('timeline.bs'), placeholder: t('timeline.bsPlaceholder') }],
    heartRate: [{ key: 'heartRate', label: t('timeline.hr'), placeholder: t('timeline.hrPlaceholder') }],
    weight: [{ key: 'weight', label: t('timeline.wt'), placeholder: t('timeline.wtPlaceholder') }],
  }

  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const config = metricConfig[metric]
  const latest = healthTrends.length > 0 ? healthTrends[healthTrends.length - 1] : null
  const prev = healthTrends.length > 1 ? healthTrends[healthTrends.length - 2] : null

  useEffect(() => {
    if (tab !== 'trends' || healthTrends.length === 0) return
    const timer = setTimeout(() => drawChart(), 100)
    return () => clearTimeout(timer)
  }, [tab, metric, healthTrends])

  function drawChart() {
    const query = Taro.createSelectorQuery()
    query.select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return
        const canvas = res[0].node
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        const width = res[0].width
        const height = res[0].height
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        ctx.clearRect(0, 0, width, height)

        const padding = { top: 20, right: 20, bottom: 36, left: 44 }
        const chartW = width - padding.left - padding.right
        const chartH = height - padding.top - padding.bottom

        const fields = config.fields
        const allValues: number[] = []
        healthTrends.forEach((tr) => {
          fields.forEach((f) => {
            const v = tr[f as keyof HealthTrend] as number | undefined
            if (v != null) allValues.push(v)
          })
        })
        if (allValues.length === 0) return

        const minVal = Math.min(...allValues) * 0.92
        const maxVal = Math.max(...allValues) * 1.08
        const range = maxVal - minVal || 1

        ctx.strokeStyle = '#eee8df'
        ctx.lineWidth = 0.5
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + (chartH * i) / 4
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(padding.left + chartW, y)
          ctx.stroke()
          ctx.fillStyle = '#ababab'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'right'
          const val = maxVal - (range * i) / 4
          ctx.fillText(val.toFixed(0), padding.left - 6, y + 4)
        }

        ctx.fillStyle = '#ababab'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        healthTrends.forEach((tr, i) => {
          const x = padding.left + (chartW * i) / Math.max(healthTrends.length - 1, 1)
          ctx.fillText(fmtShortDate(tr.date), x, height - 8)
        })

        fields.forEach((field, fi) => {
          const color = config.colors[fi] || '#5b9a7d'
          const points: { x: number; y: number }[] = []

          healthTrends.forEach((tr, i) => {
            const v = tr[field as keyof HealthTrend] as number | undefined
            if (v == null) return
            const x = padding.left + (chartW * i) / Math.max(healthTrends.length - 1, 1)
            const y = padding.top + chartH - ((v - minVal) / range) * chartH
            points.push({ x, y })
          })

          if (points.length < 2) return

          const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
          gradient.addColorStop(0, color + '30')
          gradient.addColorStop(1, color + '05')
          ctx.beginPath()
          ctx.moveTo(points[0].x, padding.top + chartH)
          points.forEach((p) => ctx.lineTo(p.x, p.y))
          ctx.lineTo(points[points.length - 1].x, padding.top + chartH)
          ctx.closePath()
          ctx.fillStyle = gradient
          ctx.fill()

          ctx.beginPath()
          ctx.strokeStyle = color
          ctx.lineWidth = 2.5
          ctx.lineJoin = 'round'
          ctx.lineCap = 'round'
          points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y)
            else ctx.lineTo(p.x, p.y)
          })
          ctx.stroke()

          points.forEach((p) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
            ctx.fillStyle = '#fff'
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.stroke()
          })
        })

        if (fields.length > 1) {
          const dotR = 4, dotGap = 8, itemGap = 24, ly = 10
          ctx.font = '11px sans-serif'
          const itemWidths = fields.map((_, fi) =>
            dotR * 2 + dotGap + ctx.measureText(config.labels[fi]).width
          )
          const totalW = itemWidths.reduce((s, w) => s + w, 0) + itemGap * (fields.length - 1)
          let curX = (width - totalW) / 2

          fields.forEach((_, fi) => {
            ctx.fillStyle = config.colors[fi]
            ctx.beginPath()
            ctx.arc(curX + dotR, ly, dotR, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#7a7a7a'
            ctx.font = '11px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(config.labels[fi], curX + dotR * 2 + dotGap, ly + 4)
            curX += itemWidths[fi] + itemGap
          })
        }
      })
  }

  function getLatestValue() {
    if (!latest) return '-'
    if (metric === 'bloodPressure') return `${latest.bloodPressureSys ?? '-'}/${latest.bloodPressureDia ?? '-'}`
    return String(latest[config.fields[0] as keyof HealthTrend] ?? '-')
  }

  function getTrend() {
    if (!prev || !latest) return { label: t('timeline.flat'), cls: 'trend-latest-trend-flat' }
    const field = config.fields[0]
    const cur = latest[field as keyof HealthTrend] as number
    const pre = prev[field as keyof HealthTrend] as number
    if (cur > pre) return { label: t('timeline.up'), cls: 'trend-latest-trend-up' }
    if (cur < pre) return { label: t('timeline.down'), cls: 'trend-latest-trend-down' }
    return { label: t('timeline.flat'), cls: 'trend-latest-trend-flat' }
  }

  function handleSaveInput() {
    const today = new Date().toISOString().split('T')[0]
    const data: HealthTrend = { date: today }
    const fields = inputFields[metric]
    fields.forEach((f) => {
      const v = parseFloat(inputVals[f.key] || '')
      if (!isNaN(v)) {
        ;(data as any)[f.key] = v
      }
    })
    if (Object.keys(data).length <= 1) {
      Taro.showToast({ title: t('timeline.inputRequired'), icon: 'none' })
      return
    }
    addHealthData(data)
    setShowInput(false)
    setInputVals({})
    Taro.showToast({ title: t('timeline.saved'), icon: 'success' })
  }

  return (
    <View className='timeline'>
      <View className='page-title'>
        <Text className='page-title-icon'>🕐</Text>
        <Text className='page-title-text'>{t('timeline.title')}</Text>
      </View>

      <View className='tab-bar'>
        <View className={`tab-btn ${tab === 'records' ? 'tab-btn-active' : ''}`} onClick={() => setTab('records')}>
          <Text>{t('timeline.records')}</Text>
        </View>
        <View className={`tab-btn ${tab === 'trends' ? 'tab-btn-active' : ''}`} onClick={() => setTab('trends')}>
          <Text>{t('timeline.trends')}</Text>
        </View>
      </View>

      {/* Records */}
      {tab === 'records' && (
        <View className='tl-wrap'>
          <View className='tl-line' />
          {sorted.map((rec) => {
            const { month, day } = formatRecordDate(rec.date)
            const expanded = expandedId === rec.id
            return (
              <View key={rec.id} className='tl-item'>
                <View className='tl-dot'><View className='tl-dot-inner' /></View>
                <View className='tl-date'>
                  <Text className='tl-date-text'>{month}</Text>
                  <Text className='tl-date-text'>{day}</Text>
                </View>
                <View className='tl-card' onClick={() => setExpandedId(expanded ? null : rec.id)}>
                  <View className='tl-card-header'>
                    <View className='tl-card-body'>
                      <View className='tl-hospital'>
                        <Text className='tl-hospital-icon'>🏥</Text>
                        <Text className='tl-hospital-name'>{rec.hospital}</Text>
                      </View>
                      <View className='tl-meta'>
                        <Text className='tl-meta-item'>🩺 {rec.department}</Text>
                        <Text className='tl-meta-item'>👤 {rec.doctor}</Text>
                      </View>
                      <Text className='tl-diagnosis'>{rec.diagnosis}</Text>
                    </View>
                    <Text className='tl-toggle'>{expanded ? '▲' : '▼'}</Text>
                  </View>
                  {expanded && (
                    <View className='tl-details'>
                      <Text className='tl-details-text'>{rec.details}</Text>
                      {rec.vitals && (
                        <View className='vitals-tags'>
                          {rec.vitals.bloodPressureSys && rec.vitals.bloodPressureDia && (
                            <Text className='vital-tag vital-tag-sage'>
                              {t('timeline.bp')} {rec.vitals.bloodPressureSys}/{rec.vitals.bloodPressureDia}
                            </Text>
                          )}
                          {rec.vitals.bloodSugar && (
                            <Text className='vital-tag vital-tag-amber'>{t('timeline.bs')} {rec.vitals.bloodSugar}</Text>
                          )}
                          {rec.vitals.heartRate && (
                            <Text className='vital-tag vital-tag-coral'>{t('timeline.hr')} {rec.vitals.heartRate}</Text>
                          )}
                          {rec.vitals.weight && (
                            <Text className='vital-tag vital-tag-sky'>{t('timeline.wt')} {rec.vitals.weight}kg</Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Trends */}
      {tab === 'trends' && (
        <View>
          <View className='metric-bar'>
            <View className='metric-chips'>
              {metricChips.map((c) => (
                <View
                  key={c.key}
                  className={`metric-chip ${metric === c.key ? 'metric-chip-active' : ''}`}
                  onClick={() => setMetric(c.key)}
                >
                  <Text>{c.emoji} {c.label}</Text>
                </View>
              ))}
            </View>
            <View className='record-btn' onClick={() => { setShowInput(true); setInputVals({}) }}>
              <Text>{t('timeline.record')}</Text>
            </View>
          </View>

          <View className='trend-latest'>
            <View className='trend-latest-row'>
              <View>
                <Text className='trend-latest-label'>{t('timeline.latest')}</Text>
                <View style={{ display: 'flex', alignItems: 'baseline' }}>
                  <Text className='trend-latest-value'>{getLatestValue()}</Text>
                  <Text className='trend-latest-unit'>{config.unit}</Text>
                </View>
              </View>
              <View className={`trend-latest-trend ${getTrend().cls}`}>
                <Text>{getTrend().label}</Text>
              </View>
            </View>
            <Text className='trend-latest-ref'>{refRanges[metric]}</Text>
          </View>

          <View className='chart-card'>
            <Canvas
              type='2d'
              id='trendCanvas'
              canvasId='trendCanvas'
              style={{ width: '100%', height: '400rpx' }}
            />
          </View>

          <View className='trend-data-list'>
            {[...healthTrends].reverse().map((tr) => {
              let val = ''
              if (metric === 'bloodPressure') val = `${tr.bloodPressureSys ?? '-'}/${tr.bloodPressureDia ?? '-'}`
              else val = String(tr[config.fields[0] as keyof typeof tr] ?? '-')
              return (
                <View key={tr.date} className='trend-data-item'>
                  <Text className='trend-data-item-date'>{tr.date}</Text>
                  <Text className='trend-data-item-value'>{val} {config.unit}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Health data input modal */}
      {showInput && (
        <View className='modal-mask'>
          <View className='modal-bg' onClick={() => setShowInput(false)} />
          <View className='modal'>
            <Text className='modal-title'>{t('timeline.recordTitle', { label: metricChips.find(c => c.key === metric)?.label || '' })}</Text>
            <Text className='modal-subtitle'>{t('timeline.dateLabel', { date: new Date().toISOString().split('T')[0] })}</Text>
            {inputFields[metric].map((f) => (
              <View key={f.key} className='modal-field'>
                <Text className='modal-field-label'>{f.label}</Text>
                <Input
                  className='modal-field-input'
                  type='digit'
                  placeholder={f.placeholder}
                  value={inputVals[f.key] || ''}
                  onInput={(e) => setInputVals((prev) => ({ ...prev, [f.key]: e.detail.value }))}
                />
                <Text className='modal-field-unit'>{config.unit}</Text>
              </View>
            ))}
            <View className='modal-actions'>
              <View className='modal-cancel' onClick={() => setShowInput(false)}>
                <Text>{t('timeline.cancel')}</Text>
              </View>
              <View className='modal-save' onClick={handleSaveInput}>
                <Text>{t('timeline.save')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
