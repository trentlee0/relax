import Vue from 'vue'
import Vuex from 'vuex'
import {backgroundType, dataKey, defaultSettings, quoteType} from '@/config/constants'
import settings from '@/store/settings'
import {deepCopy} from '@/util/commons'
import {isUTools} from '@/util/platforms'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    background: settings.getSync(dataKey.Background) || deepCopy(defaultSettings.background),
    quote: settings.getSync(dataKey.Quote) || deepCopy(defaultSettings.quote),
    notification: settings.getSync(dataKey.Notification) || deepCopy(defaultSettings.notification),
    workingTime: settings.getSync(dataKey.WorkingTime) || deepCopy(defaultSettings.workingTime),
    restingTime: settings.getSync(dataKey.RestingTime) || deepCopy(defaultSettings.restingTime),
    backgroundMusic: settings.getSync(dataKey.BackgroundMusic) || deepCopy(defaultSettings.backgroundMusic),
    automaticTiming: settings.getSync(dataKey.AutomaticTiming) || deepCopy(defaultSettings.automaticTiming)
  },
  mutations: {
    UPDATE_BACKGROUND(state, [type, val]) {
      state.background.type = type
      // 仅仅用户自定义图片/网络图片/颜色背景才需要保存
      if (val) {
        if (type === backgroundType.COLOR || type === backgroundType.NETWORK) state.background.val = val
        else if (type === backgroundType.IMAGE) {
          if (isUTools()) state.background.val = val
          else settings.setTempCache(type, val)
        } else state.background.val = ''
      }
      settings.setSync(dataKey.Background, state.background)
    },
    UPDATE_QUOTE(state, [type, val]) {
      state.quote.type = type
      if (val && type === quoteType.CUSTOM) state.quote.val = val
      else state.quote.val = ''
      settings.setSync(dataKey.Quote, state.quote)
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification
      settings.setSync(dataKey.Notification, notification)
    },
    SET_WORKING_TIME(state, workingTime) {
      state.workingTime = workingTime
      settings.setSync(dataKey.WorkingTime, workingTime)
    },
    SET_RESTING_TIME(state, restingTime) {
      state.restingTime = restingTime
      settings.setSync(dataKey.RestingTime, restingTime)
    },
    SET_ALL(state, newState) {
      for (let [key, val] of Object.entries(newState)) {
        state[key] = val
      }
      settings.setAllSync(newState)
    },
    RESET(state) {
      for (let [key, val] of Object.entries(deepCopy(defaultSettings))) {
        state[key] = val
      }
      settings.clearSync()
    },
    SET_BACKGROUND_MUSIC(state, [selected, volume]) {
      state.backgroundMusic['selected'] = selected
      state.backgroundMusic['volume'] = volume
      settings.setSync(dataKey.BackgroundMusic, state.backgroundMusic)
    },
    SET_AUTOMATIC_TIMING(state, automaticTiming) {
      state.automaticTiming = automaticTiming
      settings.setSync(dataKey.AutomaticTiming, automaticTiming)
    }
  },
  getters: {
    getAll(state) {
      return {...state}
    }
  }
})
