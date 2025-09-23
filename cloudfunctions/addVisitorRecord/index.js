const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const visitor_records = db.collection('visitor_records')

exports.main = async (event) => {
  console.log("event", event)
  const { visitData, userInfo, remark, _id } = event
  
  // 如果提供了 id，则执行更新操作，否则执行添加操作
  try {
    let result
    if (_id) {
      // 更新操作
      result = await visitor_records.doc(_id).update({
        data: {
          ...visitData,
          ...userInfo,
          remark: remark || '',
          updateTime: db.serverDate()  // 更新操作时更新 `updateTime`
        }
      })
      return {
        success: true,
        data: result,
        message: '更新成功'
      }
    } else {
      // 添加操作
      result = await visitor_records.add({
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
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
