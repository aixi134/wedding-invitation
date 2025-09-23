const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const system_config = db.collection('system_config')

// 云函数入口函数
exports.main = async (event, context) => {
  const { data: result } = await system_config.get()
  console.log(result)
  return result
}