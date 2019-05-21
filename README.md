# 对fetch简单封装

- 添加了请求缓存
- 添加了timeout,处理超时
- 添加beforeSend用于预处理请求 parseData用于处理数据
  
```js
// 请求预处理示例
request.default.beforeSend = (data) => {
  if (xx) {
    return data.xxx
  }
  throw new Errow('xxx')
}
// 数据格式化示例
request.default.parseData = (data) => {
  if (xx) {
    return data.xxx
  }
  throw new Errow('xxx')
}
/**
 *
 *
 * @export
 * @param {*} url
 * @param {*} [opts] {
 *    cache: false // 是否缓存
 *    expire: 10 * 1000 // 缓存时间 默认10秒
 *    timerout: 0 // 超时时间 默认0 即不处理超时
 * }
 * @returns {object} 返回数据或者error
 */
request(url, opts)
.then(data => console.log(data))
.catch(err => console.log(err.msg))
```