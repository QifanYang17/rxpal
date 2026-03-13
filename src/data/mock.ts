import type { MedicalRecord, Medication, FamilyMember, UserProfile, HealthTrend } from '../types'

export const userProfile: UserProfile = {
  name: '王建国',
  age: 72,
  avatar: '👴',
  sleepReminderTime: '21:30',
  fontSize: 'large',
}

export const medications: Medication[] = [
  {
    id: 'med-1',
    name: '氨氯地平片',
    dosage: '5mg',
    frequency: '每日1次',
    times: ['08:00'],
    duration: '长期',
    remainingDays: 15,
    notes: '降压药，早餐后服用',
    active: true,
  },
  {
    id: 'med-2',
    name: '二甲双胍缓释片',
    dosage: '500mg',
    frequency: '每日2次',
    times: ['08:00', '18:00'],
    duration: '长期',
    remainingDays: 20,
    notes: '降糖药，随餐服用',
    active: true,
  },
  {
    id: 'med-3',
    name: '阿托伐他汀钙片',
    dosage: '20mg',
    frequency: '每日1次',
    times: ['21:00'],
    duration: '长期',
    remainingDays: 8,
    notes: '降脂药，睡前服用',
    active: true,
  },
  {
    id: 'med-4',
    name: '阿司匹林肠溶片',
    dosage: '100mg',
    frequency: '每日1次',
    times: ['08:00'],
    duration: '长期',
    remainingDays: 25,
    notes: '抗血小板，早餐后服用',
    active: true,
  },
  {
    id: 'med-5',
    name: '氯雷他定片',
    dosage: '10mg',
    frequency: '每日1次',
    times: ['08:00'],
    duration: '7天',
    remainingDays: 3,
    notes: '抗过敏，已快用完',
    active: true,
  },
]

export const medicalRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    date: '2026-03-05',
    hospital: '北京协和医院',
    department: '心内科',
    doctor: '张明主任',
    diagnosis: '高血压2级，血压控制尚可',
    details: '患者血压近期波动较小，继续当前用药方案。建议低盐饮食，适当运动。复查时间：1个月后。',
    vitals: { bloodPressureSys: 138, bloodPressureDia: 85, heartRate: 72, weight: 68 },
    prescriptions: [{ id: 'rx-1', recordId: 'rec-1', medications: [medications[0], medications[3]] }],
  },
  {
    id: 'rec-2',
    date: '2026-02-18',
    hospital: '北京协和医院',
    department: '内分泌科',
    doctor: '李华副主任',
    diagnosis: '2型糖尿病，血糖控制良好',
    details: '空腹血糖6.8mmol/L，糖化血红蛋白6.5%。继续当前降糖方案，注意饮食控制。',
    vitals: { bloodSugar: 6.8, weight: 68.5 },
    prescriptions: [{ id: 'rx-2', recordId: 'rec-2', medications: [medications[1]] }],
  },
  {
    id: 'rec-3',
    date: '2026-01-10',
    hospital: '北京大学第一医院',
    department: '心内科',
    doctor: '张明主任',
    diagnosis: '高血压复查，血脂偏高',
    details: '血压142/88mmHg，总胆固醇5.8mmol/L，LDL 3.6mmol/L。加用他汀类降脂。',
    vitals: { bloodPressureSys: 142, bloodPressureDia: 88, heartRate: 75, weight: 69 },
    prescriptions: [{ id: 'rx-3', recordId: 'rec-3', medications: [medications[2]] }],
  },
  {
    id: 'rec-4',
    date: '2025-12-15',
    hospital: '北京协和医院',
    department: '心内科',
    doctor: '张明主任',
    diagnosis: '高血压2级，需调整用药',
    details: '血压偏高，需密切监测。增加运动量，低盐饮食。下次复查带齐检查报告。',
    vitals: { bloodPressureSys: 148, bloodPressureDia: 92, heartRate: 78, weight: 69.5 },
    prescriptions: [{ id: 'rx-4', recordId: 'rec-4', medications: [medications[0]] }],
  },
  {
    id: 'rec-5',
    date: '2025-11-20',
    hospital: '社区卫生中心',
    department: '全科',
    doctor: '王医生',
    diagnosis: '季节性过敏',
    details: '鼻塞、流涕2天，无发热。诊断为过敏性鼻炎，予以抗过敏治疗。',
    vitals: { bloodPressureSys: 135, bloodPressureDia: 82, heartRate: 70 },
    prescriptions: [{ id: 'rx-5', recordId: 'rec-5', medications: [medications[4]] }],
  },
]

export const healthTrends: HealthTrend[] = [
  { date: '2025-09', bloodPressureSys: 150, bloodPressureDia: 95, bloodSugar: 7.5, heartRate: 80, weight: 70.5 },
  { date: '2025-10', bloodPressureSys: 146, bloodPressureDia: 92, bloodSugar: 7.2, heartRate: 78, weight: 70 },
  { date: '2025-11', bloodPressureSys: 135, bloodPressureDia: 82, bloodSugar: 7.0, heartRate: 70, weight: 69.8 },
  { date: '2025-12', bloodPressureSys: 148, bloodPressureDia: 92, bloodSugar: 6.9, heartRate: 78, weight: 69.5 },
  { date: '2026-01', bloodPressureSys: 142, bloodPressureDia: 88, bloodSugar: 6.8, heartRate: 75, weight: 69 },
  { date: '2026-02', bloodPressureSys: 140, bloodPressureDia: 86, bloodSugar: 6.8, heartRate: 73, weight: 68.5 },
  { date: '2026-03', bloodPressureSys: 138, bloodPressureDia: 85, bloodSugar: 6.6, heartRate: 72, weight: 68 },
]

export const familyMembers: FamilyMember[] = [
  {
    id: 'fam-1',
    name: '王小明',
    relation: '孙子',
    avatar: '👦',
    phone: '138****1234',
    bound: true,
    lastSeen: '3分钟前',
  },
  {
    id: 'fam-2',
    name: '王丽',
    relation: '女儿',
    avatar: '👩',
    phone: '139****5678',
    bound: true,
    lastSeen: '1小时前',
  },
  {
    id: 'fam-3',
    name: '李建',
    relation: '儿子',
    avatar: '👨',
    phone: '136****9012',
    bound: true,
    lastSeen: '今天 09:30',
  },
]

// Generate today's reminders from active medications
export function generateTodayReminders(): import('../types').Reminder[] {
  const reminders: import('../types').Reminder[] = []
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

  // Sleep reminder
  reminders.push({
    id: 'rem-sleep',
    type: 'sleep',
    time: userProfile.sleepReminderTime,
    title: '该休息啦',
    subtitle: '早睡早起身体好',
    done: false,
    skipped: false,
  })

  return reminders.sort((a, b) => a.time.localeCompare(b.time))
}
