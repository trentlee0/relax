import {get} from '@/util/request'
import {QuoteType} from '@/common/constant'
import {load} from 'jinrishici'
import store from '@/store'
import dayjs from 'dayjs'

const QUOTE_REQUESTS = {
  [QuoteType.SHANBAY]: () => {
    return new Promise((resolve, reject) => {
      get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
        .then(res => resolve({
          content: res.data['translation'],
          author: res.data['author'] ? res.data['author'] : '佚名',
          english: res.data['content']
        }))
        .catch(err => reject(err))
    })
  },
  [QuoteType.HITOKOTO]: () => {
    return new Promise((resolve, reject) => {
      get('https://v1.hitokoto.cn/?c=d&c=e&c=h&c=i&c=j&c=k')
        .then(res => resolve({
          content: res.data['hitokoto'],
          author: res.data['from_who'] ? res.data['from_who'] : '佚名',
          english: ''
        }))
        .catch(err => reject(err))
    })
  },
  [QuoteType.JINRISHICI]: () => {
    return new Promise((resolve, reject) => {
      try {
        load(res => {
          const data = {
            content: res.data['content'],
            author: res.data.origin.author ? res.data.origin.author : '佚名',
            english: ''
          }
          resolve(data)
        })
      } catch (err) {
        reject(err)
      }
    })
  },
  [QuoteType.CUSTOM]: () => {
    return new Promise((resolve, reject) => {
      try {
        resolve({
          content: store.state.settings.quote.val,
          author: '迭名',
          english: ''
        })
      } catch (err) {
        reject(err)
      }
    })
  },
  [QuoteType.YOUDAO]: () => {
    return new Promise((resolve, reject) => {
      const today = dayjs().format('YYYY-MM-DD')
      get('https://dict.youdao.com/infoline?apiversion=5.0&mode=publish&update=auto&date=' + today)
        .then(res => {
          const data = res.data[today]
          const obj = {}
          for (let item of data) {
            if (item['type'] === '壹句') {
              obj.content = item['summary']
              obj.author = '迭名'
              obj.english = item['title']
              break
            }
          }
          resolve(obj)
        })
        .catch(err => reject(err))
    })
  },
  [QuoteType.ICIBA]: () => {
    return new Promise((resolve, reject) => {
      const today = dayjs().format('YYYY-MM-DD')
      get('http://sentence.iciba.com/index.php?c=dailysentence&m=getdetail&title=' + today)
        .then(res => {
          resolve({
            content: res.data['note'],
            author: '迭名',
            english: res.data['content']
          })
        })
        .catch(err => reject(err))
    })
  },
  [QuoteType.ONEYIJU]: () => {
    return new Promise((resolve, reject) => {
      get('https://api.xygeng.cn/one')
        .then(res => {
          const data = res.data['data']
          resolve({
            content: data['content'],
            author: data['origin'],
            english: ''
          })
        })
        .catch(err => reject(err))
    })
  }
}

/**
 * 通过类型名获取引言
 * @param {QuoteType} type
 * @return {Promise<{content: string, author: string, english: string}>}
 */
export function getQuoteByName(type) {
  return QUOTE_REQUESTS[type]()
}
