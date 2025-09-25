const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command
const visitor_records = db.collection('visitor_records')

const formatUserInfo = (userInfo = {}) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return {}
  }

  const allowKeys = ['avatarUrl', 'nickName', 'gender', 'city', 'province', 'country', 'language']
  return allowKeys.reduce((acc, key) => {
    if (userInfo[key] !== undefined && userInfo[key] !== null) {
      acc[key] = userInfo[key]
    }
    return acc
  }, {})
}

exports.main = async (event) => {
  const { visitData = {}, userInfo, remark, _id, shouldIncrement = true } = event
  const wxContext = cloud.getWXContext()
  const now = db.serverDate()
  const incrementValue = shouldIncrement ? 1 : 0

  try {
    const basePayload = {
      ...visitData,
      ...formatUserInfo(userInfo),
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID || '',
      visitTime: now,
      updateTime: now
    }

    if (remark !== undefined && remark !== null) {
      basePayload.remark = remark
    }

    if (Object.prototype.hasOwnProperty.call(basePayload, 'authorized')) {
      basePayload.authorized = Boolean(basePayload.authorized)
    }

    // 优先按照传入的 _id 更新
    if (_id) {
      const updateResult = await visitor_records.doc(_id).update({
        data: {
          ...basePayload,
          visitCount: _.inc(incrementValue)
        }
      })

      return {
        success: true,
        data: updateResult,
        recordId: _id,
        message: '更新成功'
      }
    }

    // 若没有传入 _id，则尝试使用 openid 查询已有记录
    const existingRecord = await visitor_records
      .where({ openid: wxContext.OPENID })
      .limit(1)
      .get()

    if (existingRecord.data.length) {
      const recordId = existingRecord.data[0]._id
      const updateResult = await visitor_records.doc(recordId).update({
        data: {
          ...basePayload,
          visitCount: _.inc(incrementValue)
        }
      })

      return {
        success: true,
        data: updateResult,
        recordId,
        message: '更新成功'
      }
    }

    // 新建访客记录
    const createResult = await visitor_records.add({
      data: {
        ...basePayload,
        visitCount: 1,
        createTime: now
      }
    })

    return {
      success: true,
      data: createResult,
      recordId: createResult._id,
      message: '添加成功'
    }
  } catch (error) {
    console.error('记录访客失败', error)
    return {
      success: false,
      message: error.message
    }
  }
}
