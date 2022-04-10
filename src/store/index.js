import Vue from 'vue'
import Vuex from 'vuex'
import {backgroundType, defaultSetting, quoteType, settingKey} from '@/util/constants'
import storages from '@/util/storages'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    backgroundSelected: storages.getString(settingKey.BackgroundSelected) || defaultSetting.backgroundSelected,
    backgrounds: storages.getObject(settingKey.Backgrounds) || defaultSetting.backgrounds,
    quoteSelected: storages.getString(settingKey.QuoteSelected) || defaultSetting.quoteSelected,
    quotes: storages.getObject(settingKey.Quotes) || defaultSetting.quotes,
    notification: storages.getObject(settingKey.Notification) || defaultSetting.notification,
    workingTime: storages.getInteger(settingKey.WorkingTime) || defaultSetting.workingTime,
    restingTime: storages.getInteger(settingKey.RestingTime) || defaultSetting.restingTime
  },
  mutations: {
    /**
     * 设置自定义图片
     */
    SET_BACKGROUND_IMAGE(state, image) {
      state.backgrounds[backgroundType.IMAGE].val = image
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 设置自定义颜色
     */
    SET_BACKGROUND_COLOR(state, color) {
      state.backgrounds[backgroundType.COLOR].val = color
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 设置自定义背景（图片、颜色）
     */
    SET_BACKGROUND_CUSTOM(state, [type, val]) {
      state.backgrounds[type].val = val
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 保存 Unsplash 图片
     */
    SET_BACKGROUND_UNSPLASH(state, unsplash) {
      state.backgrounds[backgroundType.UNSPLASH] = unsplash
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 保存 Shanbay 图片 URL
     */
    SET_BACKGROUND_SHANBAY(state, shanbay) {
      state.backgrounds[backgroundType.SHANBAY] = shanbay
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 设置内置背景来源（Unsplash、Shanbay、Bing）
     */
    SET_BACKGROUND_BUILTIN(state, [type, background]) {
      state.backgrounds[type] = background
      storages.setObject(settingKey.Backgrounds, state.backgrounds)
    },
    /**
     * 设置选择的背景选项
     */
    SET_BACKGROUND_SELECTED(state, selected) {
      state.backgroundSelected = selected
      storages.setString(settingKey.BackgroundSelected, selected)
    },
    /**
     * 设置选择的引言
     */
    SET_QUOTE_SELECTED(state, selected) {
      state.quoteSelected = selected
      storages.setString(settingKey.QuoteSelected, selected)
    },
    /**
     * 保存自定义的引言
     */
    SET_QUOTE_CUSTOM(state, quote) {
      state.quotes[quoteType.CUSTOM].val = quote
      storages.setObject(settingKey.Quotes, state.quotes)
    },
    /**
     * 保存通知设置
     */
    SET_NOTIFICATION(state, notification) {
      state.notification = notification
      storages.setObject(settingKey.Notification, notification)
    },
    /**
     * 保存工作时长
     */
    SET_WORKING_TIME(state, workingTime) {
      state.workingTime = workingTime
      storages.setString(settingKey.WorkingTime, workingTime)
    },
    /**
     * 保存休息时长
     */
    SET_RESTING_TIME(state, restingTime) {
      state.restingTime = restingTime
      storages.setString(settingKey.RestingTime, restingTime)
    },
    SET_ALL(state, newState) {
      state.backgroundSelected = newState.backgroundSelected
      state.backgrounds = newState.backgrounds
      state.quoteSelected = newState.quoteSelected
      state.quotes = newState.quotes
      state.notification = newState.notification
      state.workingTime = newState.workingTime
    }
  },
  getters: {
    getBackground(state) {
      return state.backgrounds ? state.backgrounds[state.backgroundSelected] : null
    },
    getBackgrounds(state) {
      return state.backgrounds
    },
    getQuote(state) {
      return state.quotes ? state.quotes[state.quoteSelected] : null
    },
    getCustomQuote(state) {
      return state.quotes ? state.quotes[quoteType.CUSTOM] : null
    },
    getBackgroundSelected(state) {
      return state.backgroundSelected
    },
    getQuoteSelected(state) {
      return state.quoteSelected
    },
    getNotification(state) {
      return state.notification
    },
    getWorkingTime(state) {
      return state.workingTime
    },
    getRestingTime(state) {
      return state.restingTime
    },
    getAll(state) {
      return {
        backgroundSelected: state.backgroundSelected,
        backgrounds: state.backgrounds,
        quoteSelected: state.quoteSelected,
        quotes: state.quotes,
        notification: state.notification,
        workingTime: state.workingTime,
        restingTime: state.restingTime
      }
    }
  },
  actions: {},
  modules: {}
})
