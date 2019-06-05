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
  <script src="/dist/sa-dahai.js"></script>  
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
### SaInit  
param|required|desc  
----|----|----  
server_url|true|神策项目地址  
pro_name|true|神策项目名称  
user_id|false|用户id/uid  
gps_lon|false|经度  
gps_lat|false|维度  

### SaTrack  
param|required|desc  
----|----|----  
event_name|true|事件名称  
properties|false|事件属性  
callback|false|发送完数据之后的回调  

详细请参照神策官网文档(https://www.sensorsdata.cn/manual/js_sdk.html)  
