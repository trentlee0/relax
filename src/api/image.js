import {backgroundType} from '@/util/constants'
import {get, getImagePNGToBase64} from '@/util/requests'

const IMAGES = {
  [backgroundType.UNSPLASH]: {
    name: backgroundType.UNSPLASH,
    getImage() {
      return getImagePNGToBase64('https://source.unsplash.com/800x0/daily?scenery')
    }
  },
  [backgroundType.SHANBAY]: {
    name: backgroundType.SHANBAY,
    getImage() {
      return new Promise((resolve, reject) => {
        get('https://apiv3.shanbay.com/weapps/dailyquote/quote/')
          .then(res => resolve(res.data.poster_img_urls[0]))
          .catch(err => reject(err))
      })
    }
  },
  [backgroundType.BING]: {
    name: backgroundType.BING,
    getImage() {
      return getImagePNGToBase64('https://api.isoyu.com/bing_images.php')
    }
  }
}

/**
 * 通过类型名获取图片
 * @param {backgroundType.UNSPLASH|backgroundType.SHANBAY|backgroundType.BING} name
 * @returns {Promise}
 */
export function getImageByName(name) {
  return IMAGES[name].getImage()
}
