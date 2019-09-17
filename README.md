# Installation  
`npm install sa-sdk-dahai --save`  

# Usage  
## ES2015 module import:  
`import * as DHSensor from 'sa-sdk-dahai'`  
## CommonJS module require:  
`const DHSensor = require('sa-sdk-dahai')`  
## AMD module require:  
```
require(['DHSensor'], function (DHSensor) {  
  DHSensor.SaInit(args);  
})
```

## loading it via a script tag:  
``` 
<!doctype html>  
<html>  
  ...  
  <script src="sa-dahai.js"></script>  
  <script>  
    // ...  
    // Global variable  
    DHSensor.SaInit(args)  
    // Property in the window object  
    window.DHSensor.SaInit(args)  
    // ...  
  </script>  
</html>  
```  

## Methods  
### saAutoTrack  
param|required|desc  
----|----|----  
serverUrl|true|神策项目地址  
proName|true|神策项目名称  
userId|false|用户id/uid  
其他任意属性

### saTrack  
param|required|desc  
----|----|----  
eventName|true|事件名称  
properties|false|事件属性  
callback|false|发送完数据之后的回调  

### saLogin  
param|required|desc  
----|----|----  
userId|true|用户id/uid  

### saRegisterPage  
param|required|desc  
----|----|----  
object|true|对象属性  

### saSetProfile  
param|required|desc  
----|----|----  
object|true|对象属性    

### StayDuration  
param|required|desc  
----|----|----  
eventName|true|事情名称  
elementId|true|内容id  
percent|false|内容区域百分比
根据情况附带的其他任意属性 

详细请参照神策官网文档(https://www.sensorsdata.cn/manual/js_sdk.html)  
