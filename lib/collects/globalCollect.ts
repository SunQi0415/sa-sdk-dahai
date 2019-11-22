// 全局默认采集
import { saInitBase, saQuick, saLogin, saRegisterPage, saTrack} from '../baseSensor'
import { getUrlParams, jsonPropsInterface } from '../utils/utils'
import { NDC } from './navigatorCollect'

// 暴露的方法
interface globalCollectInterface {
  saAutoTrack(): void; // 全埋点方法
  saGlobalRegisterPage(params: any): void; // 设置全局预置属性
  saPerformanceTrack(): void; // 性能监控参数
}
// 接受的参数
export interface saInitConfig {
  server_url: string; // 神策项目地址
  pro_name: string; // 神策项目名称
  user_id?: string | number; // 用户id
  show_log?: boolean; // 是否在控制台打印日志
  props?: jsonPropsInterface; // 其他任意属性
}

export class GlobalCollect implements globalCollectInterface {
  private params: saInitConfig
  static instance: any = null
  private constructor(params: saInitConfig) {
    this.params = params
  }
  public static getSingleton(params: saInitConfig) {
    if (GlobalCollect.instance === null) {
      GlobalCollect.instance = new GlobalCollect(params)
    }
    return GlobalCollect.instance
  }
  public saAutoTrack(): void {
    saInitBase({
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
    if (this.params.user_id) { saLogin(this.params.user_id) }
    // 全埋点
    saQuick('autoTrack')
  }
  public saGlobalRegisterPage(ndc: NDC) {
    let otherProps = this.params.props || {}
    if (getUrlParams().hasOwnProperty('ad_id')) {
      otherProps['ad_id'] = getUrlParams()['ad_id']
    }
    // 预置采集事件公共属性
    saRegisterPage(Object.assign({
      pro_name: this.params.pro_name, // 当前上报项目
      gps_lon: ndc.gpsLon, // 经度
      gps_lat: ndc.gpsLat, // 纬度
      current_url: location.href, // 当前url
      referrer: document.referrer, // 前一个url
      network_type: ndc.networkType, // 网络类型
      screen_name: location.pathname, //采集URL关键词，记录唯一页面标识（不包含域名）
      domain_name: document.domain // 域名
    }, otherProps))
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