// 函数节流
function throttle(fn: Function, interval: number = 500) {
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
function debounce(fn: Function, delay: number = 500) {
  let timer: any;
  return function() {
    clearTimeout(timer)
    timer = setTimeout(function() {
      fn.apply(this, arguments)
    }, delay);
  }
}
export {
  throttle,
  debounce
}