import sa from 'sa-sdk-javascript'
import { NDC, PDC } from './bomCollect'
import { throttle } from './utils'

// 全埋点
interface autoTrackConfig {
  serverUrl: string; // 神策项目地址
  proName: string; // 神策项目名称
  userId?: string | number; // 用户id
  [propName: string]: any;
}
function saAutoTrack(params: autoTrackConfig):void {
  sa.init({
    server_url: params.serverUrl,
    heatmap: {
      clickmap: 'default', // 是否开启点击图，默认 default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭
      scroll_notice_map: 'default' // 是否开启触达注意力图，默认 default 表示开启，自动采集 $WebStay 事件，可以设置 'not_collect' 表示关闭
    },
    send_timeout: 1000, //默认使用队列发数据时候，两条数据发送间的最大间隔
    use_client_time: false, // 发送事件的时间使用客户端时间还是服务端时间
    show_log: true, // 是否允许控制台打印查看埋点数据（建议开启查看）
    is_track_device_id: true, // 是否打开获取设备ID功能
    is_track_single_page: true // 单页面中自动采集web浏览事件$pageview
  })
  // 标识用户
  if (params.userId) { sa.login(params.userId) }
  // 全埋点
  sa.quick('autoTrack')

  ;(async () => {
    // performance数据上报
    let pdc: PDC = await new PDC()
    let {whiteScreenTime, domReadyTime, requestTime, onLoadTime} = pdc
    saTrack('performance', {
      whiteScreenTime: whiteScreenTime,
      domReadyTime: domReadyTime,
      requestTime: requestTime,
      onLoadTime: onLoadTime
    })

    /* 预置采集事件公共属性 */
    let paramsCopyData = params;
    delete paramsCopyData.serverUrl // 删除传入参数的serverUrl
    let ndc: NDC = await new NDC() // navigator相关数据采集

    sa.registerPage(
      Object.assign(paramsCopyData, {
        gps_lon: ndc.gpsLon, // 经度
        gps_lat: ndc.gpsLat, // 纬度
        current_url: location.href, // 当前url
        referrer: document.referrer, // 前一个url
        network_type: ndc.networkType, // 网络类型
        domain_name: document.domain // 域名
      })
    )
  })()
}

// 自定义事件追踪
interface trackInterface {
  (eventName: string, properties?: object, callback?: any): void
}

let saTrack: trackInterface = function(eventName: string, properties: object, callback: Function): void {
  sa.track(eventName, properties, callback)
}

// 设置用户属性
function saSetProfile(options: any) {
  sa.setProfile(options)
}

// 匿名ID和登录ID关联
function saLogin(userId: string | number) {
  sa.login(userId)
  sa.quick('autoTrack')
}

// 设置事件公共属性
function saRegisterPage(params: any) {
  sa.registerPage(params)
}

// 可视区域停留时长
interface stayDurationInterface {
  duration: number;
  calcDuration(scrollTop: number) : any
}
interface stayDurationParamsInterface {
  eventName: string; // 事件名称
  elementId: string; // 内容id
  percent?: number; // 内容区域临界值
  props?: object; // 根据情况附带的属性值
}
class StayDuration implements stayDurationInterface {
  public duration: number = 0;
  private elementId: string;
  private eventName: string; // 事件名称
  private percent: number; // 内容区域临界值
  private props?: object = {}; // 根据情况附带的属性值
  private timer: any;
  private flag: boolean = false;
  private static clientHeight = document.documentElement.clientHeight || document.body.clientHeight; // 指定屏幕可视区域高度(默认)
  constructor(config: stayDurationParamsInterface) {
    this.elementId = config.elementId
    this.eventName = config.eventName
    this.percent = config.percent || 100
    this.props = config.props
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    this.calcDuration(scrollTop)
    window.addEventListener('scroll', throttle(() => {
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 页面卷起高度
      this.calcDuration(scrollTop)
    }, 1000), false)
    // 监听页面url跳转和页面关闭
    window.addEventListener('popstate', this.endReport, false)
    window.addEventListener('hashchange,', this.endReport, false)
    window.addEventListener('beforeunload', this.endReport, false)
    window.addEventListener('unload', this.endReport, false)
  }
  // 计算区域停留时长
  calcDuration(scrolltop: number) {
    let {contentHeight, scrollTop, contentOffsetTop, contentViewTop} = this.domAttribute(scrolltop)
    let distance = StayDuration.clientHeight - contentViewTop
    clearInterval(this.timer)
    // 开始计时
    if (distance >= contentHeight * this.percent / 100 && distance <= StayDuration.clientHeight) {
      this.flag = true
      this.timer = setInterval(()=> {
        // console.log('开始计时')
        this.duration++
      }, 1000)
    }
    // 结束计时
    if (scrollTop - contentOffsetTop > contentHeight * (1 - this.percent / 100)) {
      if(this.flag) {
        // console.log('结束计时')
        this.flag = false
        saTrack(this.eventName, Object.assign({
          stay_duration: this.duration
        }, this.props))
      }
      return
    }
  }
  // 结束数据上报
  endReport() {
    this.flag = false
    clearInterval(this.timer)
    saTrack(this.eventName, Object.assign({
      stay_duration: this.duration
    }, this.props))
    this.duration = 0
    return
  }
  domAttribute(scrollTop: number) {
    let content = document.getElementById(this.elementId) // 内容元素id
    let contentHeight = content.offsetHeight // 内容区域高度
    let contentOffsetTop = this.calcTop(content) // 当前元素距离页面顶部的距离
    let contentViewTop = contentOffsetTop - scrollTop // 当前元素距离视口高度
    return {
      contentHeight,
      scrollTop,
      contentOffsetTop,
      contentViewTop
    }
  }
  calcTop(el: any): number {
    if (!el.parentNode) {
      return 0
    }
    return el.offsetTop + this.calcTop(el.parentNode)
  }
}

export {
  saAutoTrack,
  saTrack,
  saLogin,
  saRegisterPage,
  saSetProfile,
  StayDuration
}