import Taro from '@tarojs/taro'

// 云开发数据库操作封装
// 注意：需要先在微信公众平台开通云开发，并在 app.ts 中初始化

const db = () => {
  if (!Taro.cloud) {
    console.warn('云开发未初始化')
    return null
  }
  return Taro.cloud.database()
}

// ===== 用户 =====
export async function getUser() {
  const d = db()
  if (!d) return null
  const { data } = await d.collection('users').where({ _openid: '{openid}' }).get()
  return data[0] || null
}

export async function saveUser(profile: any) {
  const d = db()
  if (!d) return
  const existing = await getUser()
  if (existing) {
    await d.collection('users').doc(existing._id).update({ data: profile })
  } else {
    await d.collection('users').add({ data: profile })
  }
}

// ===== 睡眠提醒时间同步 =====
export async function saveSleepTime(time: string) {
  const d = db()
  if (!d) return
  const existing = await getUser()
  if (existing) {
    await d.collection('users').doc(existing._id).update({ data: { sleepReminderTime: time } })
  } else {
    await d.collection('users').add({ data: { sleepReminderTime: time } })
  }
}

// ===== 就诊记录 =====
export async function getRecords() {
  const d = db()
  if (!d) return []
  const { data } = await d.collection('records').orderBy('date', 'desc').get()
  return data
}

export async function addRecord(record: any) {
  const d = db()
  if (!d) return
  await d.collection('records').add({ data: record })
}

// ===== 药物 =====
export async function getMedications() {
  const d = db()
  if (!d) return []
  const { data } = await d.collection('medications').where({ active: true }).get()
  return data
}

export async function saveMedication(med: any) {
  const d = db()
  if (!d) return
  await d.collection('medications').add({ data: med })
}

// ===== OCR 识别 =====
export async function callOcr(filePath: string, mode?: 'box') {
  if (!Taro.cloud) return null
  try {
    const uploadRes = await Taro.cloud.uploadFile({
      cloudPath: `ocr/${Date.now()}.jpg`,
      filePath,
    })
    const { result } = await Taro.cloud.callFunction({
      name: 'ocr',
      data: { fileID: uploadRes.fileID, mode },
    })
    return result
  } catch (e) {
    console.error('OCR error:', e)
    return null
  }
}

// ===== 家人绑定 =====
export async function getFamilyMembers() {
  const d = db()
  if (!d) return []
  const { data } = await d.collection('family').get()
  return data
}

export async function bindFamily(inviteCode: string) {
  if (!Taro.cloud) return null
  const { result } = await Taro.cloud.callFunction({
    name: 'bindFamily',
    data: { inviteCode },
  })
  return result
}
