import * as sa from 'sa-sdk-javascript'
import { NDC } from './collect'
import { EventUtils, DomStyleUtils, DomAttrUtils, FuncUtils } from './utils'

// 自定义事件
function saTrack(eventName: string, properties: object, callback?: Function): void {
  sa.track(eventName, properties, callback)
}
// 设置用户属性
function saSetProfile(params: any): void {
  sa.setProfile(params)
}
// 匿名ID和登录ID关联
function saLogin(user_id: string | number) {
  sa.login(user_id)
  sa.quick('autoTrack')
}
// 设置事件公共属性
function saRegisterPage(params: any) {
  sa.registerPage(params)
}

// 默认采集
interface otherProps {
  [prop_name: string]: any;
}
interface saInitConfig {
  server_url: string; // 神策项目地址
  pro_name: string; // 神策项目名称
  user_id?: string | number; // 用户id
  show_log?: boolean;
  props?: otherProps;
}
class Point {
  private params: saInitConfig
  static instance: any = null
  private constructor(params: saInitConfig) {
    this.params = params
  }
  public static getSingleton(params: saInitConfig) {
    if (Point.instance === null) {
      Point.instance = new Point(params)
    }
    return Point.instance
  }
  public saAutoTrack(): void {
    sa.init({
      server_url: this.params.server_url,
      heatmap: {
        clickmap: 'default', // 是否开启点击图，默认 default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭
        scroll_notice_map: 'default' // 是否开启触达注意力图，默认 default 表示开启，自动采集 $WebStay 事件，可以设置 'not_collect' 表示关闭
      },
      send_timeout: 1000, //默认使用队列发数据时候，两条数据发送间的最大间隔
      use_client_time: false, // 发送事件的时间使用客户端时间还是服务端时间
      show_log: this.params.show_log || false, // 是否允许控制台打印查看埋点数据（建议开启查看）
      is_track_device_id: true, // 是否打开获取设备ID功能
      is_track_single_page: true // 单页面中自动采集web浏览事件$pageview
    })
    // 标识用户
    if (this.params.user_id) { sa.login(this.params.user_id) }
    // 全埋点
    sa.quick('autoTrack')
  }
  public async saGlobalRegisterPage(ndc: NDC) {
    // 删除传入参数的serverUrl
    let others = this.params.props || {}
    // 预置采集事件公共属性
    sa.registerPage(Object.assign(others, {
      pro_name: this.params.pro_name, // 当前上报项目
      gps_lon: ndc.gpsLon, // 经度
      gps_lat: ndc.gpsLat, // 纬度
      current_url: location.href, // 当前url
      referrer: document.referrer, // 前一个url
      network_type: ndc.networkType, // 网络类型
      screen_name: location.pathname, //采集URL关键词，记录唯一页面标识（不包含域名）
      domain_name: document.domain // 域名
    }))
  }
  public saPerformanceTrack(): any {
    window.setTimeout(() => {
      let {navigationStart, responseStart, domContentLoadedEventEnd, loadEventEnd} = window.performance.timing
      let whiteScreenTime = responseStart - navigationStart
      let domReadyTime = domContentLoadedEventEnd - navigationStart
      let onLoadTime = loadEventEnd - navigationStart
      saTrack('auto_web_pageload', {
        loading_time: onLoadTime / 1000,
        white_screen_time: whiteScreenTime / 1000,
        dom_ready_time: domReadyTime / 1000
      })
    }, 500)
  }
}

// 主入口
async function saInit(params: saInitConfig) {
  let point = Point.getSingleton(params)
  // 全埋点
  point.saAutoTrack()
  // 页面性能数据上报
  EventUtils.addHandler(window, 'load', point.saPerformanceTrack())
  // 公共数据上报
  let ndc: NDC = await new NDC() // navigator相关数据采集
  point.saGlobalRegisterPage(ndc)

  // 监听页面中除了a、input、button外所有元素的点击事件
  EventUtils.addHandler(document, 'click', (event: any) => {
    if (event.target.getAttribute('sa-collect') === 'true') {
      let properties = event.target.dataset.sa ? DomAttrUtils.dataSet(event.target, 'sa') : {}
      sa.quick('trackHeatMap', event.target, properties)
    }
  })
}

interface stayDurationParams {
  event_name: string; // 事件名称
  element: string; // 内容id
  percent?: number; // 内容区域临界值
  [prop_name: string]: any; // 根据情况附带的属性值
}
class StayDuration {
  private event_name: string
  private element: string
  private percent: number
  private props: any
  private timer: any
  private flag: boolean = false
  private duration: number = 0
  constructor(params: stayDurationParams) {
    this.event_name = params.event_name
    this.element = params.element
    this.percent = params.percent || 20
    this.props = params.props
    if (DomStyleUtils.scrollTop() === 0) {
      this.calc()
    }
    // 监听页面滚动
    EventUtils.addHandler(window, 'scroll', FuncUtils.throttle(() => {
      this.calc()
    }))
    // 监听页面url跳转和页面关闭
    EventUtils.addHandler(window, 'popstate', this.endReport)
    EventUtils.addHandler(window, 'hashchange', this.endReport)
    EventUtils.addHandler(window, 'beforeunload', this.endReport)
    EventUtils.addHandler(window, 'unload', this.endReport)
  }
  // 计算时长
  calc() {
    let el = document.querySelector(this.element)
    let {clientHeight, elementViewTop, scrollTop, elementHeight, elementTop} = DomStyleUtils.getDomStyle(el)
    clearInterval(this.timer)
    let distance = clientHeight - elementViewTop
    if (elementViewTop < clientHeight && distance >= elementHeight * this.percent / 100 && distance <= clientHeight) {
      this.flag = true
      this.timer = setInterval(()=> {
        // console.log('开始计时')
        this.duration++
      }, 1000)
    }
    // 结束计时（页面向下滚动）
    if (scrollTop - elementTop > elementHeight * (1 - this.percent / 100)) {
      if(this.flag) {
        // console.log('结束计时')
        this.endReport()
      }
      return
    }
    // 结束计时（页面向上滚动）
    if (this.flag === true && (elementViewTop < clientHeight && distance < elementHeight * this.percent / 100)) {
      // console.log('结束计时')
      this.endReport()
    }
  }
  // 结束时数据上报
  endReport() {
    this.flag = false
    clearInterval(this.timer)
    EventUtils.removeHandler(window, 'popstate', this.endReport)
    EventUtils.removeHandler(window, 'hashchange', this.endReport)
    EventUtils.removeHandler(window, 'beforeunload', this.endReport)
    if (this.duration !== 0) {
      saTrack(this.event_name, Object.assign({
        stay_duration: this.duration
      }, this.props || {}), function () {
        this.duration = 0
      })
    }
  }
}

export {
  saInit,
  saTrack,
  saSetProfile,
  saLogin,
  saRegisterPage,
  StayDuration
}