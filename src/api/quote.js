import {get} from '@/util/requests'
import {quoteType} from '@/store/constants'


const QUOTE_REQUESTS = {
  [quoteType.SHANBAY]: () => {
    return new Promise((resolve, reject) => {
      get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
        .then(res => resolve({
          content: res.data.content,
          author: res.data.author ? res.data.author : '佚名'
        }))
        .catch(err => reject(err))
    })
  },
  [quoteType.HITOKOTO]: () => {
    return new Promise((resolve, reject) => {
      get('https://international.v1.hitokoto.cn/?c=k&c=i')
        .then(res => resolve({
          content: res.data.hitokoto,
          author: res.data.from_who ? res.data.from_who : '佚名'
        }))
        .catch(err => reject(err))
    })
  }
}

/**
 * 通过类型名获取引言
 * @param {string} type
 * @return {Promise<{content,author}>}
 */
export function getQuoteByName(type) {
  return QUOTE_REQUESTS[type]()
}
