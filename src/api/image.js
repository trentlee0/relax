import {backgroundType} from '@/store/constants'
import {get, getImagePNGToBase64} from '@/util/requests'
import settings from '@/store/settings'

const IMAGE_REQUESTS = {
  [backgroundType.UNSPLASH]: () => {
    return getImagePNGToBase64('https://source.unsplash.com/800x0/daily?scenery')
  },
  [backgroundType.SHANBAY]: () => {
    return new Promise((resolve, reject) => {
      get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
        .then(res => resolve(res.data['poster_img_urls'][0]))
        .catch(err => reject(err))
    })
  },
  [backgroundType.BING]: () => {
    return getImagePNGToBase64('https://api.isoyu.com/bing_images.php')
  },
  [backgroundType.IMAGE]: () => {
    return new Promise((resolve, reject) => {
      settings.getAttachment(backgroundType.IMAGE)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  }
}

/**
 * 通过类型名获取图片
 * @param {string} type
 * @returns {Promise<string>}
 */
export function getImageByName(type) {
  return IMAGE_REQUESTS[type]()
}
