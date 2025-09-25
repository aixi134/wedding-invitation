const {
    genLocation
} = require('../../common/utils')

// 管理员openid列表，可以在云开发管理页找到，是管理员的话可以看到公告栏页面入口，也可以通过云函数greetings的返回值openid来查看，还可以在本文件getGreetings方法里通过打印openid变量来查看
const MANAGER = ['ohop817Bj849OhyAbLAxxBloH7RQ']

const APP = getApp()
const GLOBAL_DATA = (APP && APP.globalData) ? APP.globalData : {}
const INITIAL_IS_REMOVED = !!GLOBAL_DATA.isRemoved
const normalizeRecordId = (value) => {
    if (!value) {
        return ''
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === '0' || trimmed === '[object Object]') {
            return ''
        }
        return trimmed
    }

    return ''
}

Page({
    data: {
        isSinglePage: typeof GLOBAL_DATA.isSinglePage === 'boolean' ? GLOBAL_DATA.isSinglePage : null,
        recordId: normalizeRecordId(GLOBAL_DATA.recordId) || null,
        isRemoved: INITIAL_IS_REMOVED,
        magic: typeof GLOBAL_DATA.magic === 'boolean' ? GLOBAL_DATA.magic : false,
        weddingTime: GLOBAL_DATA.weddingTime || '2025-10-04 11:30',
        couple: GLOBAL_DATA.couple || [{
            image: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-jPciJQEZrC6fh7HYhNpZ2dNWDDkbEHXS.jpeg',
            name: '张家宾',
            alias: '新郎',
            number: '16602187434',
            birthday: '1997.01.30'
        }, {
            image: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-bwCWsARrGE8zr2cSNwKDHBNw6zBKTEde.jpeg',
            name: '张宇',
            alias: '新娘',
            number: '打新郎的',
            birthday: '1996.10.16'
        }],
        publisher: GLOBAL_DATA.publisher || '家宾&小宇',
        anniversary: GLOBAL_DATA.anniversary || '2020.10.08',
        userInfo: null,
        hasAuthorized: false,
        showAuthPrompt: false,
        isManager: false, // 当前用户是否为管理员
        musicIsPaused: false, // 是否暂停背景音乐
        activeIdx: INITIAL_IS_REMOVED ? 0 : -1, // 祝福语轮播用，当前显示的祝福语索引值
        form: { // 表单信息
            name: '',
            num: '',
            greeting: '',
            avatarUrl: ''
        },
        weddingTimeStr: [], // 格式化的婚礼日期列表

        // 以上变量都不用动，以下变量是需要手动修改的

        // 是否显示彩蛋（由于彩蛋我没有改动，显示的还是我本人的内容，所以我把它默认隐藏起来，方便别人抄作业）
        showEggs: false,

        // 祝福语列表
        greetings: INITIAL_IS_REMOVED ? [
            // 云开发下架后显示的祝福语数据，可以在云开发环境销毁前把数据库的数据导出来并贴到这里
            {
                name: '新郎 & 新娘',
                num: 2,
                greeting: '欢迎大家来见证我们的幸福时刻，我们婚礼上见哦~'
            }, {
                name: '伴郎 & 伴娘',
                num: 2,
                greeting: '祝帅气的新郎和美丽的新娘新婚快乐~白头偕老💐'
            }
        ] : [],

        // 背景音乐（默认用陈奕迅的《I DO》，想换的话自己去找音频资源，我是在「婚贝」上找的）
        music: {
            src: 'https://amp3.hunbei.com/mp3/shipin/LoveStory2Jianjiban.mp3', // 音频资源链接
            name: 'love story', // 歌名
            singer: 'love story' // 歌手名
        },

        // 酒店信息（通过页面上的「选择位置并获取定位信息」按钮可以获取定位信息，发布前记得把按钮注释起来）
        location: genLocation([{
            name: '环城酒家(东区店)',
            address: '河南省新乡市牧野区东明大道和中原东路交叉口西北角',
            latitude: 35.31486511230469,
            longitude: 113.94532775878906
        }])[0],

        // 图片信息（其实就是婚纱照了）
        imgs: {
            // 封面图
            cover: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-E2aDcQ3QrMj6WpBzkeEtfCB7N7iec8CA.jpeg',

            // 音乐封面
            poster: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-N5EzKh6xH3Tzfxd7ZQjrehJ4di6Wt4k3.png',

            // 新郎独照
            husband: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-jPciJQEZrC6fh7HYhNpZ2dNWDDkbEHXS.jpeg',

            // 新娘独照
            wife: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-bwCWsARrGE8zr2cSNwKDHBNw6zBKTEde.jpeg',

            // 轮播图1
            swiper1: [
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-iGJ5bMWc3P3CXxKe7efMMAQYQkTHKGYm.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-XnWSJcQK2AKETS3Xax2GxBydMkY4jH5h.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-7p4iXFEHkYFdSAFQdnHKDnjEw23f6ika.jpeg'
            ],

            // 连续图
            series: [
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-mCjBCxhjDH42sDMcwaztnZ6XNHemtweX.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-RzFiKar2ekC4f7kdcrkFKtdkp7fsNFC6.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-E2aDcQ3QrMj6WpBzkeEtfCB7N7iec8CA.jpeg'
            ],

            // 左上图
            leftUp: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-xPmPfJfzDGrXjTF8AE3eHTtiEG2YzKaZ.jpeg',

            // 左下图
            leftDown: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-2TMcDy7a63AGSKHDpnw8hpKhBeeAWQEp.jpeg',

            // 四宫图
            map: [
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-N8eicsRtWfxMjibMaKxEnjxWYx3E75JR.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-akCGzRdh3T8pwc4ck2zJxMrfnA6TXK7W.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-TQWJJSfi6smPdfBaKhX68AQQEdWY4iih.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-X3sefPW6FRwftb5dhnp8QcAzDajdrzif.jpeg'
            ],

            // 轮播图2
            swiper2: [
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-BmKEKHTAG58tPNdeMe6erdGHHsWFYCi5.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-4pjMGess27zCnaaw6zsrR4hEFtinCpdd.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-BHJtRTnHZ7atHfWCBtWbntXYcM3QdiSQ.jpeg'
            ],

            // 轮播图2下方常驻图
            swiper2Static: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-22-2TMcDy7a63AGSKHDpnw8hpKhBeeAWQEp.jpeg',

            // 轮播图3
            swiper3: [
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-FATAPJnstX2GCbtYeS5QZmN5xtY8X2JQ.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-PQmZMFKFCCeMsJTbFr7cNNA8xinfksjW.jpeg',
                'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-FATAPJnstX2GCbtYeS5QZmN5xtY8X2JQ.jpeg'
            ],

            // 结尾图1
            end1: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-jPciJQEZrC6fh7HYhNpZ2dNWDDkbEHXS.jpeg',

            // 结尾图2
            end2: 'https://h5cdn.hunbei.com/editorTempCustomPic/2025-9-20-bwCWsARrGE8zr2cSNwKDHBNw6zBKTEde.jpeg'
        }
    },

    // 小程序加载时，拉取表单信息并填充，以及格式化各种婚礼时间
    onLoad() {
        // 假设云函数更新了 magic 数据
        wx.cloud.callFunction({
            name: 'system_config',
            data: {}
        }).then(result => {
            if (result.errMsg === 'cloud.callFunction:ok') {
                const config = result.result[0]

                this.setData({
                    magic: config.magic,
                    isRemoved: config.isRemoved
                })

                if (APP && APP.globalData) {
                    APP.globalData.magic = config.magic
                    APP.globalData.isRemoved = config.isRemoved
                }
            }

            return result
        })

        this.timer = null
        this.music = null
        this.isSubmit = false
        this.recording = false
        this.pendingRecord = null

        this.initUserInfo()

        const cachedRecordId = normalizeRecordId(wx.getStorageSync('recordId') || this.data.recordId || (APP && APP.globalData && APP.globalData.recordId))
        if (cachedRecordId) {
            if (this.data.recordId !== cachedRecordId) {
                this.setData({
                    recordId: cachedRecordId
                })
            }
            if (APP && APP.globalData) {
                APP.globalData.recordId = cachedRecordId
            }
        } else if (this.data.recordId) {
            this.setData({
                recordId: null
            })
        }

        if (!this.data.isRemoved) {

            const db = wx.cloud.database()
            db.collection('surveys').get({
                success: res => {
                    console.log(res.data[0])
                    if (res.data.length) {
                        const {
                            name,
                            num,
                            greeting,
                            avatarUrl
                        } = res.data[0]
                        this.setData({
                            form: {
                                name,
                                num,
                                greeting,
                                avatarUrl
                            }
                        })
                    }
                }
            })
        }

        this.lunisolarDate = this.selectComponent('#calendar').lunisolarDate
        this.setData({
            weddingTimeStr: [
                this.lunisolarDate.format('YYYY-MM-DD HH:mm'),
                this.lunisolarDate.getSeason(),
                this.lunisolarDate.format('YYYY年MM月DD号  HH:mm'),
                this.lunisolarDate.format('农历lMlD  dddd'),
                this.lunisolarDate.format('YYYY年MM月DD号')
            ]
        })
    },

    // 小程序卸载时，取消自动拉取祝福语定时器，销毁背景音乐
    onUnload() {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (this.music !== null) {
            this.music.destroy()
            this.music = null
        }
    },

    // 小程序可见时，拉取祝福语，并设置定时器每20s重新拉取一次祝福语
    onShow() {
        if (!this.data.isRemoved) {
            this.getGreetings()

            this.timer === null && (this.timer = setInterval(() => this.getGreetings(), 20000));
        }

        if (!this.data.hasAuthorized && !this.data.showAuthPrompt) {
            this.setData({ showAuthPrompt: true })
        }

        this.recordVisit()
    },

    // 小程序不可见时，取消自动拉取祝福语定时器
    onHide() {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }
    },

    // 小程序可用时，初始化背景音乐并自动播放
    onReady() {
        if (this.music === null) {
            this.music = wx.createInnerAudioContext({
                useWebAudioImplement: false
            })
            this.music.src = this.data.music.src
            this.music.loop = true
            this.music.autoplay = true
        }
    },

    // 分享到会话
    onShareAppMessage() {
        return {
            title: '好久不见，婚礼见٩(๑^o^๑)۶',
            imageUrl: '../../images/shareAppMsg.jpg'
        }
    },

    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '好久不见，婚礼见٩(๑^o^๑)۶',
            imageUrl: '../../images/shareTimeline.jpg'
        }
    },

    // 点击右上角音乐按钮控制音频播放和暂停
    toggleMusic() {
        if (this.music.paused) {
            this.music.play()
            this.setData({
                musicIsPaused: false
            })
        } else {
            this.music.pause()
            this.setData({
                musicIsPaused: true
            })
        }
    },

    // 打开酒店定位
    openLocation() {
        const {
            latitude,
            longitude,
            name,
            address
        } = this.data.location
        wx.openLocation({
            latitude,
            longitude,
            name,
            address
        })
    },

    // 仅用于获取定位信息，获取后会打印到控制台并写入到粘贴板，正式发布时记得注释起来
    chooseLocation() {
        wx.chooseLocation({
            success(res) {
                wx.setClipboardData({
                    data: JSON.stringify(res),
                    success() {
                        wx.showToast({
                            title: '已写入剪贴板'
                        })
                        console.log(res)
                    }
                })
            }
        })
    },

    // 呼叫
    call(e) {
        wx.makePhoneCall({
            phoneNumber: e.target.dataset.phone
        })
    },

    // 提交表单
    submit(e) {
        if (!this.isSubmit) {
            const {
                name,
                num,
                avatarUrl
            } = e.detail.value
            console.log("this.form", e.detail.value)
            // let avatarUrl = this.data.form.avatarUrl
            if (name === '') {
                wx.showToast({
                    title: '要写上名字哦~',
                    icon: 'error'
                })
            } else if (num === '') {
                wx.showToast({
                    title: '要写上人数哦~',
                    icon: 'error'
                })
            } else if (!/^[1-9]\d*$/.test(num)) {
                wx.showToast({
                    title: '人数不对哦~',
                    icon: 'error'
                })
            } else {
                if (this.data.isRemoved) {
                    wx.showToast({
                        title: '婚礼结束了哦~'
                    })
                } else {
                    this.isSubmit = true
                    const wording = this.data.form.name ? '更新' : '提交';
                    wx.showLoading({
                        title: `${wording}中`
                    })
                    wx.cloud.callFunction({
                        name: 'surveys',
                        data: e.detail.value
                    }).then(({
                        result: {
                            name,
                            num,
                            greeting,
                            avatarUrl,
                            _id
                        }
                    }) => {
                        const greetings = this.data.greetings
                        !greetings.some(item => {
                            if (item._id === _id) { // 如果找到了该祝福语，更新之
                                item.greeting = greeting
                                return true
                            }
                            return false
                        }) && greetings.push({ // 如果没有找到，追加之
                            name,
                            greeting,
                            avatarUrl,
                            _id
                        })
                        this.setData({
                            form: {
                                name,
                                num,
                                greeting,
                                avatarUrl
                            },
                            greetings
                        })
                        this.isSubmit = false
                        wx.showToast({
                            title: `${wording}成功`,
                            icon: 'success'
                        })
                    })
                }
            }
        }
    },

    // 获取祝福语
    getGreetings() {
        wx.cloud.callFunction({
            name: 'greetings'
        }).then(({
            result: {
                greetings,
                openid
            }
        }) => {

            const isManager = MANAGER.indexOf(openid) > -1
            // console.log(MANAGER,openid, isManager, this.data.activeIdx, greetings.length)
            greetings.length && this.setData(this.data.activeIdx === -1 ? {
                isManager,
                greetings,
                activeIdx: 0
            } : {
                    isManager,
                    greetings
                })
        })
    },

    // 轮播动画结束时切换到下一个
    onAnimationend() {
        this.setData({
            activeIdx: (this.data.activeIdx === this.data.greetings.length - 1) ? 0 : (this.data.activeIdx + 1)
        })
    },

    // 跳转到联系新郎新娘板块
    goPhone() {
        wx.pageScrollTo({
            selector: '.phone',
            offsetTop: -200
        })
    },

    // 跳转到写表单板块
    goWrite() {
        wx.pageScrollTo({
            selector: '.form',
            offsetTop: -200
        })
    },

    // 跳转到公告栏页面
    goInfo() {
        wx.navigateTo({
            url: '../info/index'
        })
    },
    // 跳转访客页面
    goRecordInfo() {
        wx.navigateTo({
            url: `../record/index?isManager=${this.data.isManager}`
        })
    },
    handleAuthorize() {
        if (typeof wx.getUserProfile !== 'function') {
            wx.showToast({
                title: '当前微信版本过低，无法授权',
                icon: 'none'
            })
            return
        }
        wx.getUserProfile({
            desc: '用于展示访客头像和昵称，并同步访客记录',
            success: (res) => {
                const userInfo = res.userInfo || {}
                const storedForm = Object.assign({}, this.data.form || {})

                if (!storedForm.name && userInfo.nickName) {
                    storedForm.name = userInfo.nickName
                }

                if (!storedForm.avatarUrl && userInfo.avatarUrl) {
                    storedForm.avatarUrl = userInfo.avatarUrl
                }

                wx.setStorageSync('userProfile', userInfo)
                APP.globalData.userInfo = userInfo

                this.setData({
                    userInfo,
                    hasAuthorized: true,
                    showAuthPrompt: false,
                    form: storedForm
                }, () => {
                    this.recordVisit({ force: true, increment: false })
                })
            },
            fail: () => {
                wx.showToast({
                    title: '授权已取消',
                    icon: 'none'
                })
            }
        })
    },
    initUserInfo() {
        const storedProfile = wx.getStorageSync('userProfile')
        const cached = APP.globalData.userInfo || (typeof storedProfile === 'object' ? storedProfile : null)
        if (cached && typeof cached === 'object' && Object.keys(cached).length) {
            const storedForm = Object.assign({}, this.data.form || {})

            if (!storedForm.name && cached.nickName) {
                storedForm.name = cached.nickName
            }

            if (!storedForm.avatarUrl && cached.avatarUrl) {
                storedForm.avatarUrl = cached.avatarUrl
            }

            this.setData({
                userInfo: cached,
                hasAuthorized: true,
                showAuthPrompt: false,
                form: storedForm
            })
            APP.globalData.userInfo = cached
        } else {
            const canAuthorize = typeof wx.getUserProfile === 'function'
            this.setData({
                hasAuthorized: false,
                showAuthPrompt: canAuthorize
            })
        }
    },
    recordVisit(options = {}) {
        if (APP.globalData.isRemoved) {
            return
        }

        if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
            console.warn('云开发未初始化，无法记录访客信息')
            return
        }

        let force = false
        let increment = true

        if (typeof options === 'boolean') {
            force = options
        } else if (options && typeof options === 'object') {
            force = !!options.force
            if (options.increment === false) {
                increment = false
            }
        }

        if (this.recording) {
            if (force) {
                this.pendingRecord = { force: false, increment }
            }
            return
        }

        let launchOptions = {}
        try {
            launchOptions = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : {}
        } catch (error) {
            launchOptions = {}
        }

        if ((!launchOptions || Object.keys(launchOptions).length === 0) && APP.globalData.launchOptions) {
            launchOptions = APP.globalData.launchOptions
        }

        const sceneDescription = typeof APP.getSceneInfo === 'function'
            ? APP.getSceneInfo(launchOptions.scene)
            : ''

        let systemInfo = {}
        try {
            systemInfo = wx.getSystemInfoSync()
        } catch (error) {
            systemInfo = {}
        }

        const visitData = {
            sceneInfo: {
                scene: launchOptions.scene,
                path: launchOptions.path,
                query: launchOptions.query || {},
                referrerInfo: launchOptions.referrerInfo || {},
                description: sceneDescription
            },
            deviceInfo: {
                brand: systemInfo.brand,
                model: systemInfo.model,
                system: systemInfo.system,
                version: systemInfo.version,
                platform: systemInfo.platform,
                language: systemInfo.language
            },
            pagePath: launchOptions.path || 'pages/index/index',
            authorized: this.data.hasAuthorized,
            clientTime: new Date().toISOString()
        }

        const storedRecordId = normalizeRecordId(wx.getStorageSync('recordId'))
        const currentRecordId = normalizeRecordId(this.data.recordId)
        const globalRecordId = normalizeRecordId(APP && APP.globalData && APP.globalData.recordId)
        const recordId = storedRecordId || currentRecordId || globalRecordId
        const userInfo = this.data.userInfo || {}
        const formData = this.data.form || {}
        const fallbackName = formData.name || '未留名访客'
        const fallbackAvatar = formData.avatarUrl || ''

        const payloadUserInfo = Object.assign({}, userInfo, {
            nickName: userInfo.nickName || fallbackName,
            avatarUrl: userInfo.avatarUrl || fallbackAvatar
        })

        this.recording = true
        wx.cloud.callFunction({
            name: 'addVisitorRecord',
            data: {
                _id: recordId || undefined,
                visitData,
                userInfo: payloadUserInfo,
                shouldIncrement: increment
            }
        }).then((res) => {
            const { result } = res || {}
            if (result && result.success && result.recordId) {
                const normalized = normalizeRecordId(result.recordId)
                if (normalized) {
                    wx.setStorageSync('recordId', normalized)
                    if (APP && APP.globalData) {
                        APP.globalData.recordId = normalized
                    }
                    if (this.data.recordId !== normalized) {
                        this.setData({
                            recordId: normalized
                        })
                    }
                }
            }
        }).catch((error) => {
            console.error('记录访客失败', error)
        }).finally(() => {
            this.recording = false
            if (this.pendingRecord) {
                const pendingOptions = this.pendingRecord
                this.pendingRecord = null
                this.recordVisit(pendingOptions)
            }
        })
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      this.setData({
        'form.avatarUrl':avatarUrl,
      })
      this.recordVisit({ force: true, increment: false })
    }

})
