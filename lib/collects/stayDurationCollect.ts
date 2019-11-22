// 可视区域停留时长
import { saTrack } from '../baseSensor'
import { EventUtils, DomStyleUtils, FuncUtils } from '../utils/utils'

interface stayDurationParams {
  event_name: string; // 事件名称
  element: string; // 内容id
  percent?: number; // 内容区域临界值
  [prop_name: string]: any; // 根据情况附带的属性值
}

export class StayDuration {
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