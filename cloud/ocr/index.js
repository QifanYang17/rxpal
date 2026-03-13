// OCR 识别云函数
// 使用腾讯云通用文字识别 API（免费 1000 次/月，无需微信开放接口权限）
const cloud = require('wx-server-sdk')
const tencentcloud = require('tencentcloud-sdk-nodejs')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const OcrClient = tencentcloud.ocr.v20181119.Client

exports.main = async (event) => {
  const { fileID, mode } = event

  try {
    // 1. 从云存储下载图片
    const fileRes = await cloud.downloadFile({ fileID })
    const imgBase64 = fileRes.fileContent.toString('base64')

    // 2. 调用腾讯云 OCR（从环境变量读取密钥）
    const client = new OcrClient({
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: 'ap-guangzhou',
      profile: { httpProfile: { endpoint: 'ocr.tencentcloudapi.com' } },
    })

    const ocrResult = await client.GeneralBasicOCR({
      ImageBase64: imgBase64,
      LanguageType: 'zh',
    })

    // 3. 拼接识别文本
    const text = ocrResult.TextDetections.map(item => item.DetectedText).join('\n')

    // 4. 根据模式解析
    const parsed = mode === 'box' ? parseBoxText(text) : parseOcrText(text)

    return { success: true, text, parsed }
  } catch (err) {
    console.error('OCR 识别错误:', err)
    return { success: false, error: err.message }
  }
}

function parseOcrText(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const result = {
    type: 'record',
    patientName: '',
    date: '',
    hospital: '',
    department: '',
    doctor: '',
    diagnosis: '',
    medications: [],
  }

  for (const line of lines) {
    // 判断文档类型
    if (line.includes('处方') || line.includes('Rx')) result.type = 'prescription'

    // 提取患者姓名
    if (line.includes('姓名') && !result.patientName) {
      result.patientName = line.replace(/.*姓名[：:\s]*/g, '').trim()
    }

    // 提取日期
    if (line.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/) && !result.date) {
      result.date = line.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/)[0].replace(/[/.]/g, '-')
    }

    // 提取医院
    if (line.includes('医院') && !result.hospital) {
      result.hospital = line.replace(/.*[：:\s]*/g, '').trim() || line.trim()
    }

    // 提取科室
    if ((line.includes('科室') || line.match(/[内外妇儿]科/)) && !result.department) {
      const dept = line.replace(/.*科室[：:\s]*/g, '').trim()
      result.department = dept || line.match(/[\u4e00-\u9fa5]*科/)?.[0] || ''
    }

    // 提取医生
    if ((line.includes('医生') || line.includes('医师')) && !result.doctor) {
      result.doctor = line.replace(/.*[医生师][：:\s]*/g, '').trim()
    }

    // 提取诊断
    if (line.includes('诊断') && !result.diagnosis) {
      result.diagnosis = line.replace(/.*诊断[：:\s]*/g, '').trim()
    }

    // 匹配药品行（包含剂量单位关键词）
    if (line.match(/(mg|ml|片|粒|颗|g|μg|ug|丸|袋|支)\b/i)) {
      const medMatch = line.match(/^[.\d\s]*(.+?)\s+(\d+\s*(?:mg|ml|g|μg|ug))/i)
      if (medMatch) {
        result.medications.push({
          name: medMatch[1].replace(/^[.\d\s]+/, '').trim(),
          dosage: medMatch[2].trim(),
          frequency: '每日1次',
          duration: '7天',
        })
      }
    }
  }

  return result
}

// 药盒/药品说明书解析
function parseBoxText(text) {
  const result = {
    name: '',
    dosage: '',
    frequency: '每日1次',
    times: ['08:00'],
    duration: '30',
    notes: '',
  }

  // 匹配药品名称：【药品名称】/【通用名称】/【商品名】
  const nameMatch = text.match(/(?:通用名称|药品名称|商品名)[】：:\s]*([^\n【]+)/)
  if (nameMatch) {
    result.name = nameMatch[1].trim()
  } else {
    // 取第一行非空文本作为药名（通常药盒最显眼的是药名）
    const firstLine = text.split('\n').find(l => l.trim() && l.trim().length > 1)
    if (firstLine) result.name = firstLine.trim()
  }

  // 匹配【用法用量】
  const usageMatch = text.match(/用法用量[】：:\s]*([\s\S]*?)(?=【|$)/)
  if (usageMatch) {
    const usage = usageMatch[1]

    // 解析剂量："一次5mg" / "每次1片" / "一次0.5g"
    const doseMatch = usage.match(/[一每]次\s*(\d+\.?\d*\s*(?:mg|ml|g|片|粒|颗|丸|袋))/i)
    if (doseMatch) result.dosage = doseMatch[1].trim()

    // 解析频率："一日1次" / "每日2次" / "一天3次"
    const freqMatch = usage.match(/[一每](?:日|天)\s*(\d+)\s*次/)
    if (freqMatch) {
      const n = freqMatch[1]
      result.frequency = `每日${n}次`
      // 根据频率设置默认时间
      if (n === '1') result.times = ['08:00']
      else if (n === '2') result.times = ['08:00', '18:00']
      else if (n === '3') result.times = ['08:00', '12:00', '18:00']
    }

    // 提取用法备注（饭前/饭后/空腹）
    if (usage.includes('饭后') || usage.includes('餐后')) result.notes = '饭后服用'
    else if (usage.includes('饭前') || usage.includes('餐前')) result.notes = '饭前服用'
    else if (usage.includes('空腹')) result.notes = '空腹服用'
    else if (usage.includes('睡前')) {
      result.notes = '睡前服用'
      result.times = ['21:00']
    }
  }

  // 匹配【规格】作为剂量备选
  if (!result.dosage) {
    const specMatch = text.match(/规格[】：:\s]*([^\n【]+)/)
    if (specMatch) result.dosage = specMatch[1].trim()
  }

  return result
}
