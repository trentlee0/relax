import {get} from '@/util/requests'
import {quoteType} from '@/util/constants'


const QUOTES = {
  [quoteType.SHANBAY]: {
    name: quoteType.SHANBAY,
    getQuote() {
      return new Promise((resolve, reject) => {
        get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
          .then(res => resolve({
            content: res.data.content,
            author: res.data.author ? res.data.author : '佚名'
          }))
          .catch(err => reject(err))
      })
    }
  },
  [quoteType.HITOKOTO]: {
    name: quoteType.HITOKOTO,
    getQuote() {
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
}

/**
 * 通过类型名获取引言
 * @param {quoteType.HITOKOTO|quoteType.SHANBAY} name
 * @return {Promise}
 */
export function getQuoteByName(name) {
  return QUOTES[name].getQuote()
}
