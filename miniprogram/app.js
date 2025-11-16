App({
    globalData: {
        isSinglePage: null, // 是否单页模式
        // 是否为管理员
        // 以上变量都不用动，以下变量是需要修改的
        recordId: null,
        // 云开发服务是否已下架
        // isRemoved: new Date() * 1 >= 1699401600000, // 自动党，用指定时间戳来控制自动下架
        isRemoved: false, // 手动党（为防止加载初始项目时因为没有云开发环境而报错，我先设为true，等搞好云开发环境后再把它改回false）

        // 魔法开关，开启后可使用完整功能，包括填写表单、祝福语轮播和视频号播放器等等
        // magic: new Date() * 1 >= 1699401600000, // 自动党，用指定时间戳来控制自动开启
        magic: false, // 手动党（方便预览完整功能，我先设为true）

        // 婚礼日期时间
        weddingTime: '2025-10-04 11:30',

        // 新郎新娘信息
        couple: [{
            image: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-jPciJQEZrC6fh7HYhNpZ2dNWDDkbEHXS.jpeg', // 新郎单人照
            name: '张家宾', // 姓名
            alias: '新郎', // 称谓
            number: '16602187434', // 手机号码
            birthday: '1997.01.30' // 出生日期
        }, {
            image: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-bwCWsARrGE8zr2cSNwKDHBNw6zBKTEde.jpeg', // 新娘单人照
            name: '张宇', // 姓名
            alias: '新娘', // 称谓
            number: '打新郎的', // 手机号码
            birthday: '1996.10.16' // 出生日期
        }],

        // 发布者（自己想个你俩人的噱头组合名呗）
        publisher: '家宾&小宇',

        // 纪念日（如果是一见钟情的话，建议用第一次见面那天）
        anniversary: '2020.10.08'
    },

    // 小程序启动时，初始化云开发环境
    onLaunch(options) {
        !this.globalData.isRemoved && wx.cloud.init({
            env: 'cloud1-7gptyc1428d9b296', // 云开发环境ID，在云开发控制台里可以查看
            traceUser: true
        })

        const storedRecordId = wx.getStorageSync('recordId')
        if (storedRecordId) {
            this.globalData.recordId = storedRecordId
        }

        const storedProfile = wx.getStorageSync('userProfile')
        if (storedProfile && typeof storedProfile === 'object') {
            this.globalData.userInfo = storedProfile
        }

        this.globalData.launchOptions = options
    },

    // 小程序可见时，判断是否为单页模式
    onShow(options) {


        if (typeof this.globalData.isSinglePage !== 'boolean') { // 没有判断过是否单页模式，则判断一下
            const {
                scene
            } = wx.getEnterOptionsSync()
            this.globalData.isSinglePage = scene === 1154
        }
    },
    // 获取场景信息描述
    getSceneInfo(scene) {
        const sceneMap = {
            1001: '发现栏小程序主入口',
            1005: '顶部搜索框的搜索结果页',
            1006: '发现栏小程序主入口搜索框',
            1007: '单人聊天会话中的小程序消息卡片',
            1008: '群聊会话中的小程序消息卡片',
            1011: '扫描二维码',
            1012: '长按图片识别二维码',
            1013: '手机相册选取二维码',
            1014: '小程序模板消息',
            1017: '前往体验版的入口页',
            1019: '微信钱包',
            1020: '公众号 profile 页相关小程序列表',
            1022: '聊天顶部置顶小程序入口',
            1023: '安卓系统桌面图标',
            1024: '小程序 profile 页',
            1025: '扫描一维码',
            1026: '附近的小程序列表',
            1027: '顶部搜索框搜索结果页「使用过的小程序」列表',
            1028: '我的卡包',
            1029: '卡券详情页',
            1030: '自动化测试下打开小程序',
            1031: '长按图片识别一维码',
            1032: '手机相册选取一维码',
            1034: '微信支付完成页',
            1035: '公众号自定义菜单',
            1036: 'App 分享消息卡片',
            1037: '小程序打开小程序',
            1038: '从另一个小程序返回',
            1039: '摇电视',
            1042: '添加好友搜索框的搜索结果页',
            1043: '公众号模板消息',
            1044: '带 shareTicket 的小程序消息卡片',
            1045: '朋友圈广告',
            1046: '朋友圈广告详情页',
            1047: '扫描小程序码',
            1048: '长按图片识别小程序码',
            1049: '手机相册选取小程序码',
            1052: '卡券的适用门店列表',
            1053: '搜一搜的结果页',
            1054: '顶部搜索框小程序快捷入口',
            1056: '音乐播放器菜单',
            1057: '钱包中的银行卡详情页',
            1058: '公众号文章',
            1059: '体验版小程序绑定邀请页',
            1060: '微信支付完成页（与1034重复）',
            1064: '微信连Wi-Fi状态栏',
            1065: 'URL scheme',
            1067: '公众号文章广告',
            1068: '附近小程序列表广告',
            1069: '移动应用',
            1071: '钱包中的银行卡列表页',
            1072: '二维码收款页面',
            1073: '客服消息列表下发的小程序消息卡片',
            1074: '公众号会话下发的小程序消息卡片',
            1077: '摇周边',
            1078: '微信连Wi-Fi成功页',
            1079: '微信游戏中心',
            1081: '客服消息下发的文字链',
            1082: '公众号会话下发的文字链',
            1084: '朋友圈广告原生页',
            1089: '微信聊天主界面下拉',
            1090: '长按小程序右上角菜单唤出最近使用记录',
            1091: '公众号文章商品卡片',
            1092: '城市服务入口',
            1095: '小程序广告组件',
            1096: '聊天记录',
            1097: '微信支付签约页',
            1099: '页面内嵌插件',
            1102: '公众号文章下部广告位',
            1103: '插件中心',
            1104: '搜一搜电商平台',
            1106: '聊天主界面下拉',
            1113: '安卓手机负一屏',
            1114: '安卓手机侧边栏',
            1124: '扫「一物一码」打开小程序',
            1125: '长按图片识别「一物一码」',
            1126: '扫描手机相册中选取的「一物一码」',
            1129: '微信爬虫访问'
        }

        return sceneMap[scene] || `未知场景: ${scene}`
    },
})
