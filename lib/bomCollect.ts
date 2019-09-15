// navigator相关数据采集
const ua = navigator.userAgent;
interface navigatorInterface {
  networkType: string; // 网络类型
  gpsLon: number; // 经度
  gpsLat: number; // 纬度
  getNetworkType() : void;
  getLocation(): void;
}
class NavigatorCollect implements navigatorInterface {
  networkType: string;
  gpsLon: number = 0;
  gpsLat: number = 0;
  then: Function;
  constructor() {
    this.getNetworkType()
    const init = (async () => {
      await this.getLocation()
      delete this.then
      return this
    })()
    this.then = init.then.bind(init)
  }
  getNetworkType() {
    let network = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
    let networkType = network.toLowerCase().replace('nettype/', '');
    if (networkType === '3gnet') {
      networkType = '3g'
    }
    this.networkType = networkType
  }
  getLocation() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(location => {
          this.gpsLon = location.coords.longitude
          this.gpsLat = location.coords.latitude
          resolve(location)
        }, (error) => {
          reject(error)
        })
      })
    }
  }
}
// performance相关数据采集
interface performanceInterface {
  whiteScreenTime: number; // 白屏时间
  firstScreenTime: number; // 首屏时间
  domReadyTime: number; // 用户可交互时间
  requestTime: number; // 请求资源时间
  onLoadTime: number; // 页面完全加载时间
  performanceTime(): object;
}
class performanceCollect implements performanceInterface {
  whiteScreenTime: number; // 白屏时间
  firstScreenTime: number; // 首屏时间
  domReadyTime: number; // 用户可交互时间
  requestTime: number; // 请求资源时间
  onLoadTime: number; // 页面完全加载时间
  then: Function;
  constructor () {
    const init = (async () => {
      await this.performanceTime()
      delete this.then
      return this
    })()
    this.then = init.then.bind(init)
  }
  performanceTime() {
    return new Promise(resolve => {
      window.addEventListener('load', () => {
        let {navigationStart, responseStart, responseEnd, domContentLoadedEventEnd, loadEventEnd} = window.performance.timing
        this.whiteScreenTime = responseStart - navigationStart
        this.domReadyTime = domContentLoadedEventEnd - navigationStart
        this.requestTime = responseEnd - responseStart
        this.onLoadTime = loadEventEnd - navigationStart
        resolve()
      }, false)
    })
  }
}

export {
  NavigatorCollect as NDC,
  performanceCollect as PDC
}