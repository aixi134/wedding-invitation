Page({
    data: {
      isManager: false,
      visitorList: [],
      loading: false,
      hasMore: true,
      page: 1,
      pageSize: 20,
      keyword: '',
      userInfo: null
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
            loading: false
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
            loading: false
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
    formatTime(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
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