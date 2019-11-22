// import * as sa from 'sa-sdk-javascript'
import { saQuick } from './baseSensor'
import { saInitConfig, GlobalCollect } from './collects/globalCollect'
import { NDC } from './collects/navigatorCollect'
// import { FMPCollect } from './collects/fmpCollect'
import { EventUtils, DomAttrUtils } from './utils/utils'

// 主入口
async function saInit(params: saInitConfig) {
  let globalCollect = GlobalCollect.getSingleton(params)
  
  // 全埋点
  globalCollect.saAutoTrack()

  // 页面性能数据上报
  EventUtils.addHandler(window, 'load', globalCollect.saPerformanceTrack())

  // 公共数据上报
  let ndc: NDC = await new NDC() // navigator相关数据采集
  globalCollect.saGlobalRegisterPage(ndc)

  // 监听页面中除了a、input、button外所有元素的点击事件
  EventUtils.addHandler(document, 'click', (event: any) => {
    if (event.target.getAttribute('sa-collect') === 'true') {
      let properties = event.target.dataset.sa ? DomAttrUtils.dataSet(event.target, 'sa') : {}
      saQuick('trackHeatMap', event.target, properties)
    }
  })
}

export { saInit }
export * from './baseSensor'
export * from './collects/stayDurationCollect'
