
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const visitor_records = db.collection('visitor_records')
exports.main = async (event) => {
    console.log("event", event)
  const { visitData, userInfo, remark } = event
  
  try {
    const result = await visitor_records.add({
      data: {
        ...visitData,
        ...userInfo,
        remark: remark || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      data: result,
      message: '添加成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}