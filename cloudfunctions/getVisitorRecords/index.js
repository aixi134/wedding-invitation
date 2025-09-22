// cloudfunctions/getVisitorRecords/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const visitor_records = db.collection('visitor_records')

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()

  const _ = db.command
  
  const { page = 1, pageSize = 20, keyword = '' } = event
  
  try {
    // 先检查权限
    const managerResult = await visitor_records
    //   .where({ openid: wxContext.OPENID })
      .get()

    if (managerResult.data.length === 0) {
      return {
        success: false,
        message: '无权限查看访客记录'
      }
    }
    
    // 构建查询条件
    let query = visitor_records
    
    // 关键词搜索（访客姓名或访问目的）
    if (keyword) {
      query = query.where(_.or([
        { sceneInfo: db.RegExp({ regexp: keyword, options: 'i' }) },
        { nickName: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]))
    }
    
    // 获取数据
    const [listResult, countResult] = await Promise.all([
      query.orderBy('visitTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get(),
      query.count()
    ])
    
    return {
      success: true,
      data: listResult.data,
      total: countResult.total,
      page,
      pageSize
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}