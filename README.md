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
    DHSensor.saInit(args)  
    // Property in the window object  
    window.DHSensor.saInit(args)  
    // ...  
  </script>  
</html>  
```  

## Methods  
### saInit  
param|required|type|desc  
----|----|----|----  
server_url|true|string|神策项目地址  
pro_name|true|string|神策项目名称  
user_id|false|string|用户id/uid  
show_log|false|boolean|默认为false（不打印）  
props|false|object|其他任意属性  


### saTrack  
param|required|type|desc  
----|----|----|----  
event_name|true|string|事件名称  
props|false|object|事件属性  
callback|false|function|发送完数据之后的回调  

### saLogin  
param|required|type|desc  
----|----|----|----  
user_id|true|string|用户id/uid  

### saRegisterPage  
param|required|type|desc  
----|----|----|----  
object|true|object|对象属性  

### saSetProfile  
param|required|type|desc  
----|----|----|----  
object|true|object|对象属性    

### StayDuration  
param|required|type|desc  
----|----|----|----  
event_name|true|string|事情名称  
element|true|string|内容id  
percent|false|number|内容区域百分比  
props|false|object|根据情况附带的其他任意属性  

详细请参照神策官网文档(https://www.sensorsdata.cn/manual/js_sdk.html)  
