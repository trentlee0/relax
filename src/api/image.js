import {backgroundType} from '@/config/constants'
import {get, getImagePNGToBase64} from '@/util/requests'
import settings from '@/store/settings'
import store from '@/store'
import {isUTools} from '@/util/platforms'

const IMAGE_REQUESTS = {
  [backgroundType.UNSPLASH]: () => {
    return getImagePNGToBase64('https://source.unsplash.com/1920x0/daily?scenery')
  },
  [backgroundType.SHANBAY]: () => {
    return new Promise((resolve, reject) => {
      get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
        .then(res => resolve(res.data['poster_img_urls'][0]))
        .catch(err => reject(err))
    })
  },
  [backgroundType.BING]: () => {
    if (isUTools()) {
      return new Promise((resolve, reject) => {
        get('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
          .then(res => resolve('https://cn.bing.com/' + res.data['images'][0]['url']))
          .catch(err => reject(err))
      })
    }
    return getImagePNGToBase64('https://api.xygeng.cn/Bing/')
  },
  [backgroundType.IMAGE]: () => {
    return new Promise((resolve, reject) => {
      if (isUTools()) {
        resolve(store.state.background.val)
      } else {
        settings.getTempCache(backgroundType.IMAGE)
          .then(res => resolve(res.data))
          .catch(err => reject(err))
      }
    })
  },
  [backgroundType.XIAOWAI]: () => {
    return getImagePNGToBase64('https://api.ixiaowai.cn/gqapi/gqapi.php')
  },
  [backgroundType.NETWORK]: () => {
    return getImagePNGToBase64(store.state.background.val)
  }
}

/**
 * 通过类型名获取图片
 * @param {backgroundType} type
 * @returns {Promise<string>}
 */
export function getImageByName(type) {
  return IMAGE_REQUESTS[type]()
}
