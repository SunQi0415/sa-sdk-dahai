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

// 防抖函数
function debounce(fn, delay) {
  let timer = null
  return function () {
    let self = this,
      args = arguments
    timer && clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(self, args)
    }, delay)
  }
}

/**
 * @description: 全埋点
 * @param {string} server_url 神策项目地址（必选）
 * @param {string} pro_name   神策项目地址（必选）
 * @param {string} u_id       用户id（可选）
 * @param {string} gps_lon    经度（可选）
 * @param {string} gps_lat    纬度（可选）
*/
export function SaInit({ server_url, pro_name, u_id = '', gps_lon = 0, gps_lat = 0 } = {}) {
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
    is_track_single_page: true // 单页面中自动采集web浏览事件$pageview
  })

  // 标识用户（userId）
  if (u_id) {
    sa.login(u_id.toString())
  }
  // 全埋点
  sa.quick('autoTrack')
  // 预置采集属性
  sa.registerPage({
    u_id: u_id.toString(),
    pro_name: pro_name,
    gps_lon: gps_lon,
    gps_lat: gps_lat,
    current_url: location.href,
    referrer: document.referrer,
    network_type: getNetworkType(),
    domain_name: document.domain // 添加域名配置
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
export function stayTime(id, height, top) {
  let dom = document.getElementById(id)
  let bottom = height + top
  let second = 0
  let timer = null
  document.addEventListener('scroll', debounce(() => {
    if (top < document.documentElement.scrollTop || bottom > dom.offsetTop + dom.offsetHeight) {
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

/**
 * @description 内容区域停留时长
 * @param {string} eventName 事件名称（必填）
 * @param {string} id 内容id （必填）
 * @param {number} percent 内容区域临界值（必填）
 * @param {object} propsData 根据情况附带的熟悉值（选填）
*/

export class StayDuration {
  constructor (eventName, id, percent, propsData) {
    if (!id) {
      console.error('需要传入容器id')
      return
    }
    this.id = id
    this.percent = percent || 20
    this.eventName = eventName
    this.propsData = propsData
    this.dom = document.getElementById(this.id) // 获取指定dom容器
    this.viewportHeight = document.documentElement.clientHeight // 获取屏幕高度
    this.domTop = this.dom.offsetTop // 获取dom容器offsetTop值
    this.domHeight = this.dom.offsetHeight // 获取dom容器offsetHeight值
    this.precentHeight = Math.floor(this.domHeight * this.percent / 100) // 获取容器指定比例具体height值
    this.isFirstScreen = this.viewportHeight > this.domTop // 判断是否为首屏展示
    this.second = 0 // 初始化--秒
    this.timer = null // 初始化定时器索引
    this.scrollRulesObj = {
      alreadyFullScreen: this.domTop + (this.domHeight - this.precentHeight), // 首屏渲染时候 只需要考虑下线
      nothingFullScreenTopLine: this.domTop - this.viewportHeight + this.precentHeight, // 非首屏渲染时候 上线
      nothingFullScreenBottomLine: this.domTop - this.viewportHeight + (this.domHeight - this.precentHeight), // 非首屏渲染时候 下线
      lessThanPrencentHeightTopLine: this.precentHeight - Math.abs(this.domTop - this.viewportHeight), // 首屏渲染 但是超出的部分小于precentHeight 上线
      lessThanPrencentHeightBottomLine: this.domHeight - this.precentHeight - Math.abs(this.domTop - this.viewportHeight), // 首屏渲染 但是超出的部分小于precentHeight 下线
      overThanPrencentHeightBottomLine: this.domHeight - this.precentHeight - Math.abs(this.domTop - this.viewportHeight), // 首屏渲染 但是超出的部分大于于precentHeight 下线
      isOverPrecentHeight: this.domHeight - (this.viewportHeight - this.domTop) > this.precentHeight, // 首屏渲染是否是全部展示
      isOverBigPrecentHeight: this.domHeight - (this.viewportHeight - this.domTop) > this.domHeight - this.precentHeight // 首屏渲染是否大于precentHeight
    }

    this.initScrollEvent(this.isFirstScreen, this.scrollRulesObj) // 入口函数
  }
  scrollFn(fn) {
    document.addEventListener('scroll', debounce(() => {
      let nScrollTop = document.documentElement.scrollTop
      fn && fn(nScrollTop)
    }, 1000), false)
  }
  workFn(nScrollTop, rulersArray) {
    clearInterval(this.timer)
    if (rulersArray.length > 1) {
      if (nScrollTop < rulersArray[0] && nScrollTop > rulersArray[1]) {
        this.timer = setInterval(() => {
          this.second++
        }, 1000)
      } else {
        if (this.second !== 0) {
          let completeObject = Object.assign({}, {stay_duration: this.second}, this.propsData)
          sa.track(this.eventName, completeObject)
        }
        this.second = 0
      }
    } else {
      if (nScrollTop < rulersArray[0]) {
        this.timer = setInterval(() => {
          this.second++
        }, 1000)
      } else {
        if (this.second !== 0) {
          let completeObject = Object.assign({}, {stay_duration: this.second}, this.propsData)
          sa.track(this.eventName, completeObject)
        }
        this.second = 0
      }
    }
  }
  initScrollEvent(isFirstScreen, scrollRulesObj) {
    if (isFirstScreen) {
      if (scrollRulesObj.isOverPrecentHeight) {
        if (scrollRulesObj.isOverBigPrecentHeight) {
          this.scrollFn((nScrollTop) => {
            this.workFn(nScrollTop, [scrollRulesObj.lessThanPrencentHeightBottomLine, scrollRulesObj.lessThanPrencentHeightTopLine])
          })
        } else {
          this.timer = setInterval(() => {
            this.second++
          }, 1000)
          this.scrollFn((nScrollTop) => {
            this.workFn(nScrollTop, [scrollRulesObj.overThanPrencentHeightBottomLine])
          })
        }
      } else {
        this.timer = setInterval(() => {
          this.second++
        }, 1000)
        this.scrollFn((nScrollTop) => {
          this.workFn(nScrollTop, [scrollRulesObj.alreadyFullScreen])
        })
      }
    } else {
      this.scrollFn((nScrollTop) => {
        this.workFn(nScrollTop, [scrollRulesObj.nothingFullScreenBottomLine, scrollRulesObj.nothingFullScreenTopLine])
      })
    }
  }
}
