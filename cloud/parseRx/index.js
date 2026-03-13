// 处方深度解析云函数
// 对 OCR 识别后的文本做更精细的结构化解析
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 常见药品数据库（可后续扩展）
const DRUG_DB = {
  '氨氯地平': { category: '降压药', defaultFreq: '每日1次', defaultTime: ['08:00'] },
  '二甲双胍': { category: '降糖药', defaultFreq: '每日2次', defaultTime: ['08:00', '18:00'] },
  '阿托伐他汀': { category: '降脂药', defaultFreq: '每日1次', defaultTime: ['21:00'] },
  '阿司匹林': { category: '抗血小板', defaultFreq: '每日1次', defaultTime: ['08:00'] },
  '氯雷他定': { category: '抗过敏', defaultFreq: '每日1次', defaultTime: ['08:00'] },
  '美托洛尔': { category: '降压药', defaultFreq: '每日2次', defaultTime: ['08:00', '18:00'] },
  '硝苯地平': { category: '降压药', defaultFreq: '每日1次', defaultTime: ['08:00'] },
  '格列美脲': { category: '降糖药', defaultFreq: '每日1次', defaultTime: ['08:00'] },
}

exports.main = async (event) => {
  const { ocrText, medications: rawMeds } = event

  const enriched = rawMeds.map(med => {
    // 查找药品数据库匹配
    const matchKey = Object.keys(DRUG_DB).find(key => med.name.includes(key))
    const dbInfo = matchKey ? DRUG_DB[matchKey] : null

    return {
      ...med,
      category: dbInfo?.category || '其他',
      frequency: med.frequency || dbInfo?.defaultFreq || '每日1次',
      times: dbInfo?.defaultTime || ['08:00'],
      duration: med.duration || '7天',
      remainingDays: parseInt(med.duration) || 7,
      notes: dbInfo ? `${dbInfo.category}` : '',
      active: true,
    }
  })

  return { success: true, medications: enriched }
}
