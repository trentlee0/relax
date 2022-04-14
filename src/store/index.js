import Vue from 'vue'
import Vuex from 'vuex'
import {backgroundType, dataKey, defaultSettings, quoteType} from '@/store/constants'
import settings from '@/store/settings'
import dayjs from 'dayjs'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    background: settings.get(dataKey.Background) || defaultSettings.background,
    quote: settings.get(dataKey.Quote) || defaultSettings.quote,
    notification: settings.get(dataKey.Notification) || defaultSettings.notification,
    workingTime: settings.get(dataKey.WorkingTime) || defaultSettings.workingTime,
    restingTime: settings.get(dataKey.RestingTime) || defaultSettings.restingTime
  },
  mutations: {
    UPDATE_BACKGROUND(state, [type, val]) {
      state.background.type = type
      // 仅仅用户自定义图片/颜色背景才需要保存
      if (val && type === backgroundType.COLOR) state.background.val = val
      else state.background.val = ''
      if (val && type === backgroundType.IMAGE) settings.setAttachment(type, val)
      state.background.updateTime = dayjs().format('YYYYMMDD')
      settings.set(dataKey.Background, state.background)
    },
    UPDATE_QUOTE(state, [type, val]) {
      state.quote.type = type
      if (type === quoteType.CUSTOM) state.quote.val = val
      state.quote.updateTime = dayjs().format('YYYYMMDD')
      settings.set(dataKey.Quote, state.quote)
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification
      settings.set(dataKey.Notification, notification)
    },
    SET_WORKING_TIME(state, workingTime) {
      state.workingTime = workingTime
      settings.set(dataKey.WorkingTime, workingTime)
    },
    SET_RESTING_TIME(state, restingTime) {
      state.restingTime = restingTime
      settings.set(dataKey.RestingTime, restingTime)
    },
    SET_ALL(state, newState) {
      state.background = newState.background
      state.quote = newState.quote
      state.notification = newState.notification
      state.workingTime = newState.workingTime
      state.restingTime = newState.restingTime
      settings.setBulk(newState)
    },
    RESET(state) {
      state.background = defaultSettings.background
      state.quote = defaultSettings.quote
      state.notification = defaultSettings.notification
      state.workingTime = defaultSettings.workingTime
      state.restingTime = defaultSettings.restingTime


      settings.remove(dataKey.Background)
      settings.remove(dataKey.Quote)
      settings.remove(dataKey.Notification)
      settings.remove(dataKey.WorkingTime)
      settings.remove(dataKey.RestingTime)
    }
  },
  getters: {
    getAll(state) {
      return {...state}
    }
  }
})
