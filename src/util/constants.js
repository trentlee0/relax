/**
 * 背景类型
 */
export const backgroundType = {
  UNSPLASH: 'unsplash',
  SHANBAY: 'shanbay',
  IMAGE: 'image',
  COLOR: 'color',
  BING: 'bing'
}

/**
 * 背景类型对应的中文
 */
export const backgroundChinese = {
  shanbay: '扇贝',
  unsplash: 'Unsplash',
  color: '自定义颜色背景',
  image: '自定义图片背景',
  bing: '必应'
}

/**
 * 引言类型
 */
export const quoteType = {
  CUSTOM: 'custom',
  HITOKOTO: 'hitokoto',
  SHANBAY: 'shanbay'
}

/**
 * 引言类型对应的中文
 */
export const quoteChinese = {
  custom: '自定义',
  hitokoto: '一言',
  shanbay: '扇贝'
}

/**
 * uTools 插件的 Feature
 */
export const uToolsFeatureCodes = {
  Home: 'take-a-break',
  Work: 'start-work',
  Rest: 'start-rest',
  StopOrContinue: 'stop-continue-clock'
}


/**
 * 设置键值对中的建
 */
export const settingKey = {
  BackgroundSelected: 'backgroundSelected',
  Backgrounds: 'backgrounds',
  QuoteSelected: 'quoteSelected',
  Quotes: 'quotes',
  Notification: 'notification',
  WorkingTime: 'workingTime',
  RestingTime: 'restingTime',
  Statistics: 'statistics'
}

/**
 * 默认设置
 */
export const defaultSetting = {
  backgroundSelected: backgroundType.UNSPLASH,
  backgrounds: {
    color: {type: backgroundType.COLOR, val: '#616161', updateTime: ''},
    image: {type: backgroundType.IMAGE, val: '', updateTime: ''},
    unsplash: {type: backgroundType.UNSPLASH, val: '', updateTime: ''},
    shanbay: {type: backgroundType.SHANBAY, val: '', updateTime: ''},
    bing: {type: backgroundType.BING, val: '', updateTime: ''}
  },
  quoteSelected: quoteType.HITOKOTO,
  quotes: {
    custom: {type: quoteType.CUSTOM, val: ''},
    hitokoto: {type: quoteType.HITOKOTO, val: ''},
    shanbay: {type: quoteType.SHANBAY, val: ''}
  },
  workingTime: 45 * 60,
  restingTime: 5 * 60,
  notification: {
    whenEndOfWorkingTime: true,
    beforeEndOfWorkingTime: false,
    whenEndOfRestingTime: true
  }
}
