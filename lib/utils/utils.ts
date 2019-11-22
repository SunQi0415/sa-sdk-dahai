// 事件实体类
class EventUtils {
  static addHandler(element: any, type: string, handler: Function): void {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false)
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler)
    } else {
      element["on" + type] = handler
    }
  }
  static removeHandler(element: any, type: string, handler: Function): void {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false)
    } else if (element.detachEvent){
      element.detachEvent("on" + type, handler)
    } else {
      element["on" + type] = null
    }
  }
  static getEvent(event: any) {
    return event ? event : window.event
  }
  static getTarget(event: any) {
    return event.target || event.srcElement
  }
  static preventDefault(event: any) {
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }
  static stopPropagation(event: any) {
    if (event.stopPropagation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
  }
}

// dom样式实体类
class DomStyleUtils {
  public static getDomStyle(element?: any | void) {
    return {
      scrollTop: DomStyleUtils.scrollTop(),
      scrollLeft: DomStyleUtils.scrollLeft(),
      clientWidth: DomStyleUtils.clientWidth(),
      clientHeight: DomStyleUtils.clientHeight(),
      elementWidth: element ? DomStyleUtils.elementWidth(element) : 0,
      elementHeight: element ? DomStyleUtils.elementHeight(element) : 0,
      elementLeft: element ? DomStyleUtils.elementLeft(element) : 0,
      elementTop: element ? DomStyleUtils.elementTop(element) : 0,
      elementViewLeft: element ? DomStyleUtils.elementViewLeft(element) : 0,
      elementViewTop: element ? DomStyleUtils.elementViewTop(element) : 0,
    }
  }
  public static scrollTop() {
    return document.documentElement.scrollTop || document.body.scrollTop
  }
  public static scrollLeft() {
    return document.documentElement.scrollLeft || document.body.scrollLeft
  }
  public static clientWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth
  }
  public static clientHeight() {
    return document.documentElement.clientHeight || document.body.clientHeight
  }
  public static elementWidth(element: any): number {
    return element.offsetWidth
  }
  public static elementHeight(element: any): number {
    return element.offsetHeight
  }
  public static elementLeft(element: any): number {
    if (!element.offsetParent) {
      return 0
    }
    return element.offsetLeft + DomStyleUtils.elementLeft(element.offsetParent)
  }
  public static elementTop(element: any): number {
    if (!element.offsetParent) {
      return 0
    }
    return element.offsetTop + DomStyleUtils.elementTop(element.offsetParent)
  }
  public static elementViewLeft(element: any): number {
    return DomStyleUtils.elementLeft(element) - DomStyleUtils.scrollLeft()
  }
  public static elementViewTop(element: any): number {
    return DomStyleUtils.elementTop(element) - DomStyleUtils.scrollTop()
  }
}

// DOM属性相关
class DomAttrUtils {
  public static dataSet(target: any, attr: string): Object {
    let attribute = target.dataset[attr]
    if (attribute) {
      let arr = attribute.split(',')
      let map = new Map()
      let properties = Object.create(null)
      arr.forEach((element: any) => {
        let k:string = element.split(':')[0]
        map.set(k, element.split(':')[1])
      });
      map.forEach((value, key) => {
        properties[key] = value.trim()
      })
      return properties
    } else {
      return {}
    }
  }
}

// 函数操作相关实体类
class FuncUtils {
  // 函数节流
  public static throttle(fn: Function, interval: number = 500) {
    let run: boolean = true;
    return function() {
      if (!run) return;
      run = false;
      setTimeout(function() {
        fn.apply(this, arguments);
        run = true;
      }, interval)
    }
  }
  // 函数防抖
  public static debounce(fn: Function, delay: number = 500) {
    let timer: any;
    return function() {
      clearTimeout(timer)
      timer = setTimeout(function() {
        fn.apply(this, arguments)
      }, delay);
    }
  }
}

function getStyle(element: any, attr: any): any {
  // 特性侦测
  if (window.getComputedStyle) {
    // 优先使用W3C规范
    return window.getComputedStyle(element)[attr]
  } else {
    // 针对IE9以下兼容
    return element.currentStyle[attr];
  }
}

// 获取url参数
function getUrlParams(): {[key: string]: any} {
  let search: string = window.location.search
  let queryObj: {[key: string]: any} = new Object()
  if (search.indexOf('?') !== -1) {
    let query = search.substr(1)
    let queryArr = query.split('&')
    for (let i = 0; i < queryArr.length; i++) {
      queryObj[queryArr[i].split('=')[0]] = unescape(queryArr[i].split('=')[1])
    }
  }
  return queryObj
}

// json格式接口
interface jsonPropsInterface {
  [prop_name: string]: any;
}

export {
  EventUtils,
  DomStyleUtils,
  DomAttrUtils,
  FuncUtils,
  getUrlParams,
  getStyle,
  jsonPropsInterface
}