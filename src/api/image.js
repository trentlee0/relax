import {BackgroundType} from '@/common/constant'
import {get, getImagePNGToBase64} from '@/util/request'
import settings from '@/api/settings'
import store from '@/store'
import {isUTools} from '@/util/common'

const IMAGE_REQUESTS = {
  [BackgroundType.UNSPLASH]: () => {
    return getImagePNGToBase64('https://source.unsplash.com/1920x0/daily?scenery')
  },
  [BackgroundType.SHANBAY]: () => {
    return new Promise((resolve, reject) => {
      get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
        .then(res => resolve(res.data['poster_img_urls'][0]))
        .catch(err => reject(err))
    })
  },
  [BackgroundType.BING]: () => {
    return new Promise((resolve, reject) => {
      if (isUTools()) {
        get('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
          .then(res => resolve('https://cn.bing.com/' + res.data['images'][0]['url']))
          .catch(err => reject(err))
      } else {
        get('https://api.xygeng.cn/Bing/')
          .then(res => resolve(res.data.data.url))
          .catch(err => reject(err))
      }
    })
  },
  [BackgroundType.IMAGE]: () => {
    return new Promise((resolve, reject) => {
      if (isUTools()) {
        resolve(store.getters.background.val)
      } else {
        settings.getTempCache(BackgroundType.IMAGE)
          .then(res => resolve(res.data))
          .catch(err => reject(err))
      }
    })
  },
  [BackgroundType.XIAOWAI]: () => {
    return getImagePNGToBase64('https://api.ixiaowai.cn/gqapi/gqapi.php')
  },
  [BackgroundType.NETWORK]: () => {
    return getImagePNGToBase64(store.state.settings.background.val)
  }
}

/**
 * 通过类型名获取图片
 * @param {BackgroundType} type
 * @returns {Promise<string>}
 */
export function getImageByName(type) {
  return IMAGE_REQUESTS[type]()
}
