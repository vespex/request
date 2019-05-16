# 对fetch简单封装

- 添加了请求缓存
- 添加了timeout
- 添加dataFormat
  
```js
// 数据预处理示例
request.default.dataFormat = (data) {
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