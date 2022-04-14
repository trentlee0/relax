/**
 * 背景类型
 */
export const backgroundType = {
  UNSPLASH: 'unsplash',
  SHANBAY: 'shanbay',
  BING: 'bing',
  IMAGE: 'image',
  COLOR: 'color'
}

/**
 * 背景类型对应的中文
 */
export const backgroundChinese = {
  unsplash: 'Unsplash',
  shanbay: '扇贝',
  bing: '必应',
  image: '自定义图片背景',
  color: '自定义颜色背景'
}

/**
 * 引言类型
 */
export const quoteType = {
  HITOKOTO: 'hitokoto',
  SHANBAY: 'shanbay',
  CUSTOM: 'custom'
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
 * 数据库中的键值对中的建
 */
export const dataKey = {
  Background: 'background',
  Quote: 'quote',
  WorkingTime: 'workingTime',
  RestingTime: 'restingTime',
  Notification: 'notification',
  Statistics: 'statistics'
}

/**
 * 默认设置
 */
export const defaultSettings = {
  background: {
    type: backgroundType.BING,
    val: '',
    updateTime: ''
  },
  quote: {
    type: quoteType.HITOKOTO,
    val: '',
    updateTime: ''
  },
  workingTime: 45 * 60,
  restingTime: 5 * 60,
  notification: {
    whenEndOfWorkingTime: true,
    beforeEndOfWorkingTime: false,
    whenEndOfRestingTime: true
  }
}
