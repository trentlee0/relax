<template>
  <div id="setting-page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="$router.replace('/')"
        :title="`主页 (${shortcuts.global.HOME})`"
      >
        <MyIcon>mdi-home-outline</MyIcon>
      </v-btn>

      <v-toolbar-title>设置</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        icon
        title="保存"
        @click="save"
        :title="`保存设置 (${shortcuts.setting.SAVE})`"
      >
        <MyIcon>mdi-content-save-outline</MyIcon>
      </v-btn>
    </v-toolbar>

    <ToTop></ToTop>

    <Dialog
      title="是否重置设置？"
      :show="deleteSettingDialog"
      @confirm="deleteSettingDialogOk"
      @cancel="deleteSettingDialog = false"
    >
    </Dialog>

    <Dialog
      title="是否删除统计数据？"
      :show="deleteStatisticDialog"
      @confirm="deleteStatisticDialogOk"
      @cancel="deleteStatisticDialog = false"
    >
    </Dialog>

    <v-snackbar
      v-model="successSnackbar"
      :value="true"
      :timeout="2000"
      color="success"
    >
      <MyIcon>mdi-check-circle-outline</MyIcon>
      <strong class="pl-2"> {{ successSnackbarMsg }}</strong>
    </v-snackbar>

    <v-snackbar
      v-model="infoSnackbar"
      :value="true"
      :timeout="2000"
    >
      <strong class="pl-2"> {{ infoSnackbarMsg }}</strong>
    </v-snackbar>

    <v-snackbar
      v-model="errorSnackbar"
      :value="true"
      :timeout="5000"
      color="error"
    >
      <strong class="pl-2"> {{ errorSnackbarMsg }}</strong>
    </v-snackbar>

    <div id="container">
      <v-list
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">时间</v-subheader>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">
              专注时长：{{ workingTime }} 分
            </v-subheader>
            <div>
              <v-slider
                v-model="workingTime"
                min="1"
                max="120"
                :thumb-size="24"
                dense
                persistent-hint
                thumb-label
              ></v-slider>
            </div>

            <v-subheader class="pl-0">
              休息时长：{{ restingTime }} 分
            </v-subheader>
            <v-slider
              v-model="restingTime"
              min="1"
              max="30"
              :thumb-size="24"
              dense
              thumb-label
            ></v-slider>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-checkbox
            v-model="automaticTiming.working"
            label="自动专注计时"
            dense
          ></v-checkbox>
        </v-list-item>

        <v-list-item>
          <v-checkbox
            dense
            v-model="automaticTiming.resting"
            label="自动休息计时"
          ></v-checkbox>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">提醒</v-subheader>

        <v-list-item>
          <v-checkbox
            dense
            v-model="notification.whenEndOfWorkingTime"
            label="专注结束发送通知"
          ></v-checkbox>
        </v-list-item>

        <v-list-item v-if="isUTools">
          <v-checkbox
            dense
            v-model="notification.showWindowWhenEndOfWorkingTime"
            label="专注结束显示主窗口"
          ></v-checkbox>
        </v-list-item>

        <v-list-item>
          <v-checkbox
            dense
            v-model="notification.beforeEndOfWorkingTime"
            label="专注结束前 15 秒发送通知"
          ></v-checkbox>
        </v-list-item>
        <v-list-item>
          <v-checkbox
            dense
            v-model="notification.whenEndOfRestingTime"
            label="休息结束发送通知"
          ></v-checkbox>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">通用</v-subheader>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">引言来源</v-subheader>
            <v-select
              v-model="quoteSourceSelectedItem"
              :items="quoteSourceItems"
              menu-props="auto"
              dense
              label="Hello"
              solo
            >
            </v-select>

            <v-text-field
              v-if="isCustomQuote"
              label="请输入引言"
              autofocus
              dense
              v-model="customQuote"
              solo
            ></v-text-field>

            <v-subheader class="pl-0">背景来源</v-subheader>
            <v-select
              v-model="backgroundSelectedItem"
              :items="backgroundTypeItems"
              menu-props="auto"
              dense
              solo
            ></v-select>


            <div v-if="isColor" class="d-flex justify-center">
              <v-col>
                <v-card :style="{'background-color': bgColor}">
                  <v-color-picker
                    v-model="bgColor"
                  >
                  </v-color-picker>
                </v-card>
              </v-col>
            </div>

            <div v-else-if="isImage">
              <div>
                <v-form
                  ref="form"
                  v-model="imageSizeValid"
                  lazy-validation
                >
                  <v-file-input
                    :rules="rules"
                    dense
                    accept="image/png"
                    :prepend-icon="$vuetify.icons.values['mdi-file-image']"
                    label="选择背景图片"
                    @click:clear="clearImageFile"
                    @change="selectImageFile"
                  ></v-file-input>
                </v-form>
              </div>
              <v-card>
                <v-img
                  :src="bgImage"
                  class="white--text align-end"
                  :gradient="!bgImage || !bgImage.trim() ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)' : ''"
                  height="250px"
                >
                </v-img>
              </v-card>
            </div>

            <div v-else-if="isNetworkImage">
              <v-text-field
                v-model="networkImage"
                label="图片地址"
                menu-props="auto"
                dense
                solo
                @input="changeNetworkImage"
              ></v-text-field>
              <v-card>
                <v-img
                  :src="networkImage"
                  class="white--text align-end"
                  :gradient="!networkImage || !networkImage.trim() ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)' : ''"
                  height="250px"
                >
                </v-img>
              </v-card>
            </div>

          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">数据</v-subheader>
        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">导入</v-subheader>
            <small class="ml-5 text-caption">* 会覆盖原数据</small>
            <v-row>
              <v-col cols="6">
                <v-file-input
                  accept=".json"
                  outlined
                  dense
                  v-model="settingFile"
                  @change="importSettingFile = $event"
                  label="选择导入设置文件"
                ></v-file-input>
              </v-col>
              <v-col cols="6">
                <v-btn class="mt-1" color="primary" @click="importSetting">
                  开始导入
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-row>
              <v-col cols="6">
                <v-file-input
                  accept=".json"
                  outlined
                  dense
                  v-model="statisticFile"
                  @change="importStatisticFile = $event"
                  label="选择导入统计文件"
                ></v-file-input>
              </v-col>
              <v-col cols="6">
                <v-btn class="mt-1" color="primary" @click="importStatistic">
                  开始导入
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">导出</v-subheader>
            <v-row class="pl-2 pr-2">
              <v-col>
                <v-btn block large color="primary" @click="exportSetting">
                  导出设置数据
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="pl-2 pr-2">
              <v-col>
                <v-btn block large color="primary" @click="exportStatistic">
                  导出统计数据
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">删除</v-subheader>
            <v-row class="pl-2 pr-2">
              <v-col>
                <v-btn block large color="error" @click="deleteSetting">
                  重置设置
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="pl-2 pr-2">
              <v-col>
                <v-btn block large color="error" @click="deleteStatistic">
                  删除统计数据
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import {
  backgroundChinese,
  BackgroundType,
  QuoteType,
  quoteChinese, crossDomainBackground, crossDomainQuote
} from '@/common/constant'
import {isUTools} from '@/util/common'
import Dialog from '@/components/Dialog'
import settings from '@/api/settings'
import statistics from '@/api/statistics'
import {arrayBufferToBase64ImagePNG} from '@/util/request'
import {mapState} from 'vuex'
import MyIcon from '@/components/MyIcon'
import ToTop from '@/components/ToTop'
import dayjs from 'dayjs'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'

export default {
  name: 'Setting',
  components: {ToTop, Dialog, MyIcon},
  data() {
    return {
      quoteSourceSelectedItem: '',
      customQuote: '',
      backgroundSelectedItem: '',
      bgColor: '#616161',
      bgImage: '',
      networkImage: '',
      successSnackbar: false,
      successSnackbarMsg: '',
      errorSnackbar: false,
      errorSnackbarMsg: '',
      infoSnackbar: false,
      infoSnackbarMsg: '',
      deleteSettingDialog: false,
      deleteStatisticDialog: false,
      fileMaxSize: 2_000_000,
      rules: [
        value => !value || value.size < this.fileMaxSize || '背景图片大小应该小于' + this.fileMaxSize / 1_000_000 + 'MB！'
      ],
      imageSizeValid: true,
      importSettingFile: null,
      importStatisticFile: null,
      workingTime: 0,
      restingTime: 0,
      automaticTiming: {},
      settingFile: null,
      statisticFile: null,
      shortcuts: shortcuts
    }
  },
  created() {
    hotkeys(Object.values(shortcuts.setting).join(','), 'setting', (event, handler) => {
      event.preventDefault()
      switch (handler.key) {
        case shortcuts.setting.SAVE:
          this.save()
          break
      }
    })
  },
  activated() {
    hotkeys.setScope('setting')

    this.initPage()
  },
  computed: {
    ...mapState({
      background: state => state.settings.background,
      quote: state => state.settings.quote,
      workingTimeFromStore: state => state.settings.workingTime / 60,
      restingTimeFromStore: state => state.settings.restingTime / 60,
      notification: state => state.settings.notification,
      automaticTimingFromStore: state => state.settings.automaticTiming
    }),
    quoteSourceItems() {
      return Object
        .values(QuoteType)
        .filter(value => isUTools() ? true : crossDomainQuote.indexOf(value) === -1)
        .map(value => quoteChinese[value])
    },
    backgroundTypeItems() {
      return Object
        .values(BackgroundType)
        .filter(value => isUTools() ? true : crossDomainBackground.indexOf(value) === -1)
        .map(value => backgroundChinese[value])
    },
    isImage() {
      return this.backgroundSelectedItem === backgroundChinese.image
    },
    isNetworkImage() {
      return this.backgroundSelectedItem === backgroundChinese.network
    },
    isColor() {
      return this.backgroundSelectedItem === backgroundChinese.color
    },
    isCustomQuote() {
      return this.quoteSourceSelectedItem === quoteChinese.custom
    },
    isUTools() {
      return isUTools()
    }
  },
  methods: {
    initPage() {
      this.initState()
      window.document.documentElement.style.overflowY = 'auto'
    },
    initState() {
      this.workingTime = this.workingTimeFromStore
      this.restingTime = this.restingTimeFromStore
      this.backgroundSelectedItem = backgroundChinese[this.background.type]
      this.quoteSourceSelectedItem = quoteChinese[this.quote.type]
      this.automaticTiming = {...this.automaticTimingFromStore}

      if (this.$store.state.settings.quote.val) this.customQuote = this.$store.state.settings.quote.val

      if (this.background.val) {
        if (this.background.type === BackgroundType.COLOR)
          this.bgColor = this.background.val
        else if (this.background.type === BackgroundType.NETWORK)
          this.networkImage = this.background.val
      }

      if (isUTools()) {
        this.bgImage = this.background.val
      } else {
        settings.getTempCache(BackgroundType.IMAGE)
          .then(res => this.bgImage = res.data)
      }
    },
    save() {
      try {
        const selectedQuoteType = this.getKeyByValue(quoteChinese, this.quoteSourceSelectedItem)
        this.$store.commit('UPDATE_QUOTE', [selectedQuoteType, this.customQuote])

        const selectedBackgroundType = this.getKeyByValue(backgroundChinese, this.backgroundSelectedItem)
        if (this.background.type !== selectedBackgroundType) {
          this.showInfoSnackBar('请重新进入使背景生效')
        }
        switch (selectedBackgroundType) {
          case BackgroundType.COLOR:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.bgColor])
            break
          case BackgroundType.IMAGE:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.bgImage])
            break
          case BackgroundType.NETWORK:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.networkImage])
            break
          default:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType])
        }

        this.$store.commit('SET_WORKING_TIME', this.workingTime * 60)
        this.$store.commit('SET_RESTING_TIME', this.restingTime * 60)
        this.$store.commit('SET_NOTIFICATION', this.notification)
        this.$store.commit('SET_AUTOMATIC_TIMING', {...this.automaticTiming})

        this.showSuccessSnackBar('保存成功')
      } catch (err) {
        this.showErrorSnackBar('保存失败，原因：' + err.message)
      }
    },
    deleteSetting() {
      this.deleteSettingDialog = true
    },
    showSuccessSnackBar(msg) {
      this.successSnackbar = true
      this.successSnackbarMsg = msg
    },
    showErrorSnackBar(msg) {
      this.errorSnackbar = true
      this.errorSnackbarMsg = msg
    },
    showInfoSnackBar(msg) {
      this.infoSnackbar = true
      this.infoSnackbarMsg = msg
    },
    deleteSettingDialogOk() {
      this.$store.commit('RESET')
      settings.clearTempCache().then(() => {
        this.initState()
        console.log(this.$store.state)
        this.deleteSettingDialog = false
        this.showSuccessSnackBar('重置成功')
      }).catch(err => this.showErrorSnackBar('重置失败，原因：' + err.message))
    },
    deleteStatistic() {
      this.deleteStatisticDialog = true
    },
    deleteStatisticDialogOk() {
      statistics.removeStatistic()
        .then(() => {
          this.deleteStatisticDialog = false
          this.showSuccessSnackBar('删除成功')
        })
        .catch(err => this.showErrorSnackBar('删除失败，原因：' + err.message))
    },
    toTop() {
      scrollTo(0, 0)
    },
    getKeyByValue(obj, targetVal) {
      for (let [key, val] of Object.entries(obj)) if (val === targetVal) return key
    },
    selectImageFile(file) {
      if (!file) return
      if (this.isUTools) {
        this.bgImage = file.path
      } else {
        let reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = () => {
          if (this.imageSizeValid) this.bgImage = arrayBufferToBase64ImagePNG(reader.result)
        }
      }
    },
    changeNetworkImage() {
      this.networkImage = this.networkImage ? this.networkImage.trim() : ' '
      setTimeout(() => {
        this.networkImage = this.networkImage === ' ' ? '' : this.networkImage
      }, 200)
    },
    clearImageFile() {
      this.bgImage = ' '
    },
    exportSetting() {
      settings.exportSettingToJSON(this.$store.state.settings)
        .then(() => this.showSuccessSnackBar('导出成功'))
        .catch(err => this.showErrorSnackBar('导出失败，原因：' + err.message))
    },
    importSetting() {
      let file = this.importSettingFile
      if (!file) {
        this.showErrorSnackBar('请选择文件')
        return
      }
      settings.importJSONToSetting(file).then(res => {
        this.$store.commit('SET_ALL', res.data)
        this.initState()
        this.showSuccessSnackBar('导入成功')
      }).catch(err => {
        this.showErrorSnackBar('导入失败，原因：' + err.message)
      })
      this.settingFile = null
    },
    exportStatistic() {
      statistics.exportStatisticToJSON(`relax_statistics_${dayjs().format('YYYY-MM-DD')}.json`)
        .then(() => this.showSuccessSnackBar('导出成功'))
        .catch(err => this.showErrorSnackBar('导出失败，原因：' + err.message))
    },
    importStatistic() {
      let file = this.importStatisticFile
      if (!file) {
        this.showErrorSnackBar('请选择文件')
        return
      }
      statistics.exportStatisticToJSON('relax_statistics_back.json').then(() => {
        statistics.importJSONToStatistic(file)
          .then(() => this.showSuccessSnackBar('导入成功'))
          .catch(err => this.showErrorSnackBar('导入失败，原因：' + err.message))
        this.statisticFile = null
      })

    }
  }
}
</script>

<style scoped>
</style>
