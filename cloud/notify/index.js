// 定时提醒推送云函数
// 配合定时触发器，每小时检查需要发送的提醒（药物 + 睡眠）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 模板 ID（在小程序后台申请）
const MED_TEMPLATE_ID = '5-Rg6xhVJHTodh0nF1ZNAy45P3etBXK4nTDsSGo_6Tc'
const SLEEP_TEMPLATE_ID = '7mw-Hl2E-gwArs7dZyWOYvCdSrh3GmD23FyTHknxm3M' // ← 替换为真实的睡眠提醒模板 ID

exports.main = async () => {
  const now = new Date()
  const currentHour = now.getHours().toString().padStart(2, '0')
  const notifications = []

  try {
    // ===== 1. 药物提醒 =====
    const { data: medications } = await db.collection('medications')
      .where({ active: true })
      .get()

    for (const med of medications) {
      const matchTime = med.times?.find(t => t.startsWith(currentHour))
      if (!matchTime) continue

      const today = now.toISOString().split('T')[0]
      const { data: reminders } = await db.collection('reminders')
        .where({ medicationId: med._id, date: today, time: matchTime, done: true })
        .get()

      if (reminders.length > 0) continue

      try {
        await cloud.openapi.subscribeMessage.send({
          touser: med._openid,
          templateId: MED_TEMPLATE_ID,
          page: 'pages/home/index',
          data: {
            thing1: { value: med.name },
            time2: { value: matchTime },
            thing3: { value: `${med.dosage}，${med.notes || '请按时服药'}` },
          },
        })
        notifications.push({ type: 'med', name: med.name, user: med._openid })
      } catch (e) {
        console.error('药物提醒发送失败:', e)
      }
    }

    // ===== 2. 睡眠提醒 =====
    if (SLEEP_TEMPLATE_ID !== 'YOUR_SLEEP_TEMPLATE_ID') {
      // 查找设置了当前小时睡眠提醒的用户
      const { data: users } = await db.collection('users')
        .where({ sleepReminderTime: db.RegExp({ regexp: `^${currentHour}:` }) })
        .get()

      for (const user of users) {
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: user._openid,
            templateId: SLEEP_TEMPLATE_ID,
            page: 'pages/profile/index',
            data: {
              thing1: { value: '该休息啦' },
              time2: { value: user.sleepReminderTime },
              thing3: { value: '早睡早起身体好，晚安！' },
            },
          })
          notifications.push({ type: 'sleep', user: user._openid })
        } catch (e) {
          console.error('睡眠提醒发送失败:', e)
        }
      }
    }

    return { success: true, sent: notifications.length, details: notifications }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
