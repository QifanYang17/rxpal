import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { MedicalRecord, Medication, Reminder, FamilyMember, UserProfile, HealthTrend } from '../types'
import {
  medicalRecords as mockRecords,
  medications as mockMeds,
  familyMembers as mockFamily,
  userProfile as mockProfile,
  healthTrends as mockTrends,
} from '../data/mock'
import { taroStorage } from './storage'

type Lang = 'zh' | 'en'

interface AppState {
  profile: UserProfile
  records: MedicalRecord[]
  medications: Medication[]
  reminders: Reminder[]
  family: FamilyMember[]
  healthTrends: HealthTrend[]
  lang: Lang

  toggleReminder: (id: string) => void
  skipReminder: (id: string) => void
  updateSleepTime: (time: string) => void
  updateAvatar: (avatar: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updateFontSize: (size: 'normal' | 'large' | 'xlarge') => void
  addRecord: (record: MedicalRecord) => void
  addHealthData: (data: HealthTrend) => void
  setLang: (lang: Lang) => void
  addMedication: (med: Medication) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  removeMedication: (id: string) => void
  regenerateReminders: () => void
}

function buildReminders(medications: Medication[], sleepTime: string): Reminder[] {
  const reminders: Reminder[] = []
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  medications.filter(m => m.active).forEach(med => {
    med.times.forEach((time, idx) => {
      reminders.push({
        id: `rem-${med.id}-${idx}`,
        type: 'medication',
        time,
        title: med.name,
        subtitle: `${med.dosage} · ${med.notes}`,
        medicationId: med.id,
        done: time < currentTime && Math.random() > 0.3,
        skipped: false,
      })
    })
  })

  reminders.push({
    id: 'rem-sleep',
    type: 'sleep',
    time: sleepTime,
    title: '该休息啦',
    subtitle: '早睡早起身体好',
    done: false,
    skipped: false,
  })

  return reminders.sort((a, b) => a.time.localeCompare(b.time))
}

function updateTabBarLabels(lang: Lang) {
  const labels = {
    zh: ['首页', '时间线', '识别', '用药', '我的'],
    en: ['Home', 'Timeline', 'Scan', 'Meds', 'Me'],
  }
  labels[lang].forEach((text, index) => {
    Taro.setTabBarItem({ index, text })
  })
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: mockProfile,
      records: mockRecords,
      medications: mockMeds,
      reminders: buildReminders(mockMeds, mockProfile.sleepReminderTime),
      family: mockFamily,
      healthTrends: [...mockTrends],
      lang: 'zh' as Lang,

      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, done: !r.done, skipped: false } : r
          ),
        })),

      skipReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, skipped: !r.skipped, done: false } : r
          ),
        })),

      updateSleepTime: (time) =>
        set((s) => ({
          profile: { ...s.profile, sleepReminderTime: time },
          reminders: s.reminders.map((r) =>
            r.type === 'sleep' ? { ...r, time } : r
          ),
        })),

      updateAvatar: (avatar) =>
        set((s) => ({ profile: { ...s.profile, avatar } })),

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      updateFontSize: (size) =>
        set((s) => ({ profile: { ...s.profile, fontSize: size } })),

      addRecord: (record) =>
        set((s) => ({ records: [record, ...s.records] })),

      addHealthData: (data) =>
        set((s) => {
          const existing = s.healthTrends.findIndex((t) => t.date === data.date)
          if (existing >= 0) {
            const updated = [...s.healthTrends]
            updated[existing] = { ...updated[existing], ...data }
            return { healthTrends: updated }
          }
          return { healthTrends: [...s.healthTrends, data].sort((a, b) => a.date.localeCompare(b.date)) }
        }),

      setLang: (lang) => {
        set({ lang })
        updateTabBarLabels(lang)
      },

      addMedication: (med) =>
        set((s) => {
          const medications = [...s.medications, med]
          return { medications, reminders: buildReminders(medications, s.profile.sleepReminderTime) }
        }),

      updateMedication: (id, updates) =>
        set((s) => {
          const medications = s.medications.map(m => m.id === id ? { ...m, ...updates } : m)
          return { medications, reminders: buildReminders(medications, s.profile.sleepReminderTime) }
        }),

      removeMedication: (id) =>
        set((s) => {
          const medications = s.medications.filter(m => m.id !== id)
          return { medications, reminders: buildReminders(medications, s.profile.sleepReminderTime) }
        }),

      regenerateReminders: () =>
        set((s) => ({
          reminders: buildReminders(s.medications, s.profile.sleepReminderTime),
        })),
    }),
    {
      name: 'rxpal-store',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        profile: state.profile,
        medications: state.medications,
        records: state.records,
        healthTrends: state.healthTrends,
        lang: state.lang,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.reminders = buildReminders(state.medications, state.profile.sleepReminderTime)
          updateTabBarLabels(state.lang)
        }
      },
    }
  )
)
