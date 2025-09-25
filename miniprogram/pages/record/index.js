Page({
    data: {
      isManager: false,
      visitorList: [],
      loading: false,
      hasMore: true,
      page: 1,
      pageSize: 20,
      keyword: '',
      userInfo: null,
      totalCount: 0,
      defaultAvatar: 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png'
    },
  
    onLoad(options) {
        const isManager = options.isManager === 'true'
    
        this.setData({
          isManager: isManager
        })
        if (isManager) {
            this.getVisitorRecords()
          } else {
            this.checkManagerPermission() // 双重验证
          }
    },
  
    onPullDownRefresh() {
      if (this.data.isManager) {
        this.getVisitorRecords().then(() => {
          wx.stopPullDownRefresh()
        })
      } else {
        wx.stopPullDownRefresh()
      }
    },
  
    onReachBottom() {
      if (this.data.hasMore && this.data.isManager && !this.data.loading) {
        this.loadMoreRecords()
      }
    },
  
    // 检查管理员权限
    async checkManagerPermission() {
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'checkManager'
        })
        
        if (result.success) {
          this.setData({
            isManager: result.isManager,
            userInfo: result.userInfo
          })
          
          if (result.isManager) {
            this.getVisitorRecords()
          }
        } else {
          wx.showToast({
            title: result.message,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('检查权限失败:', error)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },
  
    // 获取访客记录
    async getVisitorRecords() {
      if (this.data.loading) return
      
      this.setData({ loading: true })
      
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getVisitorRecords',
          data: {
            page: 1,
            pageSize: this.data.pageSize,
            keyword: this.data.keyword
          }
        })
        
        if (result.success) {
          this.setData({
            visitorList: result.data,
            page: 1,
            hasMore: result.data.length < result.total,
            loading: false,
            totalCount: result.total
          })
        } else {
          wx.showToast({
            title: result.message,
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      } catch (error) {
        console.error('获取记录失败:', error)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
    },
  
    // 加载更多
    async loadMoreRecords() {
      if (!this.data.hasMore || this.data.loading) return
      
      this.setData({ loading: true })
      
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getVisitorRecords',
          data: {
            page: this.data.page + 1,
            pageSize: this.data.pageSize,
            keyword: this.data.keyword
          }
        })
        
        if (result.success) {
          this.setData({
            visitorList: [...this.data.visitorList, ...result.data],
            page: this.data.page + 1,
            hasMore: (this.data.page + 1) * this.data.pageSize < result.total,
            loading: false,
            totalCount: result.total
          })
        } else {
          this.setData({ loading: false })
        }
      } catch (error) {
        console.error('加载更多失败:', error)
        this.setData({ loading: false })
      }
    },
  
    // 搜索功能
    onSearchInput(e) {
      this.setData({
        keyword: e.detail.value.trim()
      })
    },
  
    // 执行搜索
    onSearch() {
      this.getVisitorRecords()
    },
  
    // 清空搜索
    onClearSearch() {
      this.setData({ keyword: '' }, () => {
        this.getVisitorRecords()
      })
    },
  
    // 格式化时间显示
    formatTime(dateInput) {
      if (!dateInput) {
        return '--'
      }

      const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
      if (Number.isNaN(date.getTime())) {
        return '--'
      }

      const pad = (value) => value.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },

    formatDeviceInfo(deviceInfo) {
      if (!deviceInfo || typeof deviceInfo !== 'object') {
        return '未获取到设备信息'
      }

      const parts = []
      if (deviceInfo.brand) {
        parts.push(deviceInfo.brand)
      }
      if (deviceInfo.model) {
        parts.push(deviceInfo.model)
      }
      if (deviceInfo.system) {
        parts.push(deviceInfo.system)
      }
      if (deviceInfo.version) {
        parts.push(`版本 ${deviceInfo.version}`)
      }
      if (deviceInfo.platform) {
        parts.push(`平台 ${deviceInfo.platform}`)
      }
      return parts.join(' · ') || '未获取到设备信息'
    },

    formatSceneInfo(sceneInfo) {
      if (!sceneInfo) {
        return '直接打开'
      }

      if (typeof sceneInfo === 'string') {
        return sceneInfo
      }

      const { scene, path, query = {}, referrerInfo = {}, description, pagePath } = sceneInfo
      const info = []

      if (description) {
        info.push(description)
      }

      if (scene !== undefined) {
        info.push(`场景值 ${scene}`)
      }

      if (path) {
        info.push(path)
      }

      if (pagePath) {
        info.push(`页面 ${pagePath}`)
      }

      const queryKeys = Object.keys(query || {})
      if (queryKeys.length) {
        const queryString = queryKeys.map(key => `${key}=${query[key]}`).join('&')
        info.push(`参数 ${queryString}`)
      }

      if (referrerInfo.appId) {
        info.push(`来源小程序 ${referrerInfo.appId}`)
      }

      return info.join(' | ') || '直接打开'
    },
  
    // 删除记录（需要额外权限验证）
    async deleteRecord(e) {
      const { id } = e.currentTarget.dataset
      
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'deleteVisitorRecord', // 需要创建对应的云函数
          data: { id }
        })
        
        if (result.success) {
          wx.showToast({ title: '删除成功' })
          this.getVisitorRecords() // 刷新列表
        }
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  })