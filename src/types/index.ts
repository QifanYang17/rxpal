export interface MedicalRecord {
  id: string
  date: string
  hospital: string
  department: string
  doctor: string
  diagnosis: string
  details: string
  vitals?: {
    bloodPressureSys?: number
    bloodPressureDia?: number
    bloodSugar?: number
    heartRate?: number
    weight?: number
  }
  prescriptions: Prescription[]
}

export interface Prescription {
  id: string
  recordId: string
  medications: Medication[]
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string // e.g. "每日3次"
  times: string[] // e.g. ["08:00", "12:00", "18:00"]
  duration: string // e.g. "7天"
  remainingDays: number
  notes: string
  active: boolean
}

export interface Reminder {
  id: string
  type: 'medication' | 'sleep'
  time: string
  title: string
  subtitle?: string
  medicationId?: string
  done: boolean
  skipped: boolean
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  avatar: string
  phone: string
  bound: boolean
  lastSeen?: string
}

export interface UserProfile {
  name: string
  age: number
  avatar: string
  sleepReminderTime: string
  fontSize: 'normal' | 'large' | 'xlarge'
}

export interface HealthTrend {
  date: string
  bloodPressureSys?: number
  bloodPressureDia?: number
  bloodSugar?: number
  heartRate?: number
  weight?: number
}
