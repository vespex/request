import 'whatwg-fetch';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function parseError(msg = '网络错误', code) {
  const error = new Error(msg);

  error.msg = msg;
  code && (error.code = code);
  return error;
}

function checkStatus(res) {
  // 请求状态处理
  const { status, statusText } = res;

  if (status >= 200 && status < 300) {
    return res;
  }

  const msg = codeMessage[status] || statusText;
  const error = parseError(msg, status);

  throw error;
}

function checkCache(url, cacheOpt) {
  const now = Date.now();
  const store = sessionStorage.getItem(url);

  if (store) {
    const s = JSON.parse(store);

    if (now - s.ts < cacheOpt.expire) {
      return s.data;
    } else {
      sessionStorage.removeItem(url);
    }
  }

  return false;
}

function stringify (params) {
  const p = []

  for (let i in params) {
    p.push(`${i}=${params[i]}`)
  }

  return p.join('&')
}

function formatParams (url, params) {
  const join = url.indexOf('?') === -1 ? '?' : '&'
  
  return `${url}${join}${stringify(params)}`
}

export class Request {
  constructor(url, opts = {}) {
    this.url = url;
    this.opts = opts;
  }

  then(fn) {
    const { cache, expire = 10 * 1000, timeout = 0, ...opts } = this.opts;
    const cacheOpts = { cache, expire }; // 缓存配置

    opts.params && (this.url = formatParams(this.url, opts.params)); // get参数拼装

    const cacheResult = checkCache(this.url, cacheOpts);

    if (cacheResult) {
      // 缓存判断
      return fn(Promise.resolve(cacheResult));
    }

    if (
      opts.method === 'POST' ||
      opts.method === 'PUT' ||
      opts.method === 'DELETE'
    ) {
      if (!(opts.body instanceof FormData)) {
        opts.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          ...opts.headers,
        };
        opts.body =
          opts.headers['Content-Type'].indexOf('application/json') === -1
            ? stringify(opts.body)
            : JSON.stringify(opts.body);
      } else {
        // opts.body is FormData
        opts.headers = {
          Accept: 'application/json',
          ...opts.headers,
        };
      }
    }

    return fn(
      Promise.race([
        fetch(this.url, opts),
        new Promise((resovle, reject) => {
          timeout > 0 &&
            setTimeout(() => reject(parseError('请求超时')), timeout); // 超时处理
        }),
      ])
        .then(checkStatus)
        .then(res => {
          // DELETE and 204 do not return data by default
          // using .json will report an error.
          if (opts.method === 'DELETE' || res.status === 204) {
            return res.text();
          }
          return res.json();
        })
        .then(res => {
          if (cacheOpts.cache) {
            // 缓存存储
            sessionStorage[this.url] = JSON.stringify({
              data: res,
              ts: Date.now(),
            });
          }
          return res;
        }),
    );
  }
}

request.default = {
  // credentials: 'include' // 跨域cookie
  beforeSend (opts) { return opts }, // 请求前处理
  parseData (opts, data) { return data } // 统一解析数据
};

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
export default function request(url, opts = {}) {
  const { beforeSend, parseData, ...otherDefault } = request.default;
  const newOpts = { ...otherDefault, ...opts };

  beforeSend(newOpts)

  return Promise.resolve(new Request(url, newOpts)).then(parseData.bind(null, newOpts));
}
