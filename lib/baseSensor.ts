// 神策sdk提供的方法
import * as sa from 'sa-sdk-javascript'

// 全埋点
export function saInitBase(params: object) {
  sa.init(params)
}
export function saQuick(event: string, target: object = null, properties: object = null) {
  sa.quick(event)
}
// 自定义事件
export function saTrack(eventName: string, properties: object, callback?: Function): void {
  sa.track(eventName, properties, callback)
}
// 设置用户属性
export function saSetProfile(params: any): void {
  sa.setProfile(params)
}
// 匿名ID和登录ID关联
export function saLogin(user_id: string | number) {
  sa.login(user_id)
  sa.quick('autoTrack')
}
// 设置事件公共属性
export function saRegisterPage(params: any) {
  sa.registerPage(params)
}
