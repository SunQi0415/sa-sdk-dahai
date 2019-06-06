import sa from 'sa-sdk-javascript';

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

export function SaInit({server_url, pro_name, u_id = '', gps_lon = 0, gps_lat = 0} = {}) {
  sa.init({
    server_url: server_url,
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
  if (u_id) {
    sa.login(u_id)
  }
  // 全埋点
  sa.quick('autoTrack')
  // 预置采集属性
  sa.registerPage({
    u_id: u_id,
    pro_name: pro_name,
    gps_lon: gps_lon,
    gps_lat: gps_lat,
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
export function SaTrack(event_name, properties, callback) {
  sa.track(event_name, properties, callback)
}

/**
   * @description 区域停留时长
   * @param {string} id 内容id （必填）
   * @param {number} heigh 可视区域（必填）
   * @param {number} top 可视区域距离顶端高度（必填）
   */
function debounce(method, delay) {
  let timer = null
    return function () {
      let self = this,
          args = arguments
      timer && clearTimeout(timer)
      timer = setTimeout(function () {
          method.apply(self,args)
      },delay)
    }
}
export function stayTime(id, height, top) {
  let dom = document.getElementById(id)
  let bottom = height + top
  let second = 0
  let timer
  document.addEventListener('scroll', debounce(() => {
      if (top < document.documentElement.scrollTop ||
        bottom > dom.offsetTop + dom.offsetHeight) {
        timer = setInterval(() => {
          second++
        }, 2000)
        sa.track({
          stay_time: second
        })
      } else {
        second = 0
        clearInterval(timer)
      }
  }, 2000), false)
}
