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
      try {
        await this.getLocation()
      } catch {}
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
    let _gpsLon = window.localStorage.getItem('gpsLon')
    if (navigator.geolocation && !_gpsLon) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(location => {
          this.gpsLon = location.coords.longitude
          this.gpsLat = location.coords.latitude
          window.localStorage.setItem('gpsLon', String(location.coords.longitude))
          resolve(location)
        }, (error) => {
          reject(error)
        })
      })
    }
  }
}

export {
  NavigatorCollect as NDC
}