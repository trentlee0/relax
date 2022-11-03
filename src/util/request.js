import axios from 'axios'

export function get(url) {
  return axios.request({
    url: url,
    method: 'get'
  })
}

export function arrayBufferToBase64(arrayBuffer, type) {
  return 'data:' + type + ';base64,' + Buffer.from(arrayBuffer, 'binary').toString('base64')
}

export function arrayBufferToBase64ImagePNG(arrayBuffer) {
  return arrayBufferToBase64(arrayBuffer, 'image/png')
}

/**
 * @param {string} url
 * @return {Promise<string>}
 */
export function getImagePNGToBase64(url) {
  return new Promise((resolve, reject) => {
    axios.request({
      url: url,
      method: 'get',
      responseType: 'arraybuffer',
      timeout: 60_000
    })
      .then(res => resolve(arrayBufferToBase64ImagePNG(res.data)))
      .catch(err => reject(err))
  })
}
