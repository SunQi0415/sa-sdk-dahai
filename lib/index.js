import sa from 'sa-sdk-javascript'

// 获取网络类型
function getNetworkType() {
  var ua = navigator.userAgent;
  var networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
  networkStr = networkStr.toLowerCase().replace('nettype/', '');
  var networkType = '';
  switch (networkStr) {
      case 'wifi':
          networkType = 'wifi';
          break;
      case '4g':
          networkType = '4g';
          break;
      case '3g':
          networkType = '3g';
          break;
      case '3gnet':
          networkType = '3g';
          break;
      case '2g':
          networkType = '2g';
          break;
      default:
          networkType = 'other';
  }
  return networkType;
}

class Sensor {
  constructor(args) {
    this.server_url = args.server_url
    this.user_id = args.user_id
    this.pro_name = args.pro_name
    this.gps_lon = args.gps_lon || 0
    this.gps_lat = args.gps_lat || 0
    this.init()
  }

  //全埋点
  init() {
    sa.init({
      server_url: this.server_url,
      heatmap: {
        clickmap: 'default', // 是否开启点击图，默认 default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭
        scroll_notice_map: 'default' // 是否开启触达注意力图，默认 default 表示开启，自动采集 $WebStay 事件，可以设置 'not_collect' 表示关闭
      },
      send_timeout: 1000, //默认使用队列发数据时候，两条数据发送间的最大间隔
      use_client_time: false, // 发送事件的时间使用客户端时间还是服务端时间
      show_log: true, // 是否允许控制台打印查看埋点数据（建议开启查看）
      is_track_device_id: true, // 是否打开获取设备ID功能
      is_track_single_page: false // 单页面中自动采集web浏览事件$pageview

    })
  
    // 标识用户（userId）
    if (this.user_id) {
      sa.login(this.user_id)
    }
    // 全埋点
    sa.quick('autoTrack')
    // 预置采集属性
    sa.registerPage({
      pro_name: this.pro_name,
      gps_lon: this.gps_lon,
      gps_lat: this.gps_lat,
      current_url: location.href,
      referrer: document.referrer,
      network_type: getNetworkType()
    })
  }

  /**
   * @description: 自定义事件追踪
   * @param {string} event_name 事件名称（必选）
   * @param {object} properties 事件属性（可选）
   * @param {function} callback 发送完数据之后的回调（可选）
  */
  event(event_name, properties, callback) {
    sa.track(event_name, properties, callback)
  }
}

module.exports = Sensor
