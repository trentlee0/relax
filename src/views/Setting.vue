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

    <div>
      <v-list>
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
          ></v-checkbox>
        </v-list-item>

        <v-list-item>
          <v-checkbox
            v-model="automaticTiming.resting"
            label="自动休息计时"
          ></v-checkbox>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-subheader class="font-weight-bold">提醒</v-subheader>

        <v-list-item>
          <v-checkbox
            v-model="notification.whenEndOfWorkingTime"
            label="专注结束发送通知"
          ></v-checkbox>
        </v-list-item>

        <v-list-item v-if="isUTools">
          <v-checkbox
            v-model="notification.showWindowWhenEndOfWorkingTime"
            label="专注结束显示主窗口"
          ></v-checkbox>
        </v-list-item>

        <v-list-item>
          <v-checkbox
            v-model="notification.beforeEndOfWorkingTime"
            label="专注结束前 15 秒发送通知"
          ></v-checkbox>
        </v-list-item>
        <v-list-item>
          <v-checkbox
            v-model="notification.whenEndOfRestingTime"
            label="休息结束发送通知"
          ></v-checkbox>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-subheader class="font-weight-bold">通用</v-subheader>
        <v-list-item>
          <v-checkbox
            v-model="enableFocusEfficiency"
            label="开启记录专注效率"
          ></v-checkbox>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item>
              <v-list-item-content>
                <v-row align="center">
                  <v-col>引言来源</v-col>
                  <v-col>
                    <v-select
                      v-model="quoteSourceSelectedItem"
                      :items="quoteSourceItems"
                      menu-props="auto"
                      hide-details
                      solo
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row v-if="isCustomQuote">
                  <v-col></v-col>
                  <v-col>
                    <v-text-field
                      label="输入引言"
                      autofocus
                      v-model="customQuote"
                      solo
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-row align="center">
                  <v-col>背景来源</v-col>
                  <v-col>
                    <v-select
                      v-model="backgroundSelectedItem"
                      :items="backgroundTypeItems"
                      menu-props="auto"
                      hide-details
                      solo
                    ></v-select>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-show="isColor || isImage || isNetworkImage">
              <v-list-item-content>
                <div v-if="isColor" class="d-flex justify-center">
                  <v-col>
                    <v-card :style="{'background-color': bgColor}">
                      <v-color-picker v-model="bgColor">
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
                        :rules="fileRules"
                        outlined
                        accept="image/png"
                        :prepend-icon="$vuetify.icons.values['mdi-file-image']"
                        :label="bgImage ? '改变背景图片' : '选择背景图片'"
                        @click:clear="bgImage = ''"
                        @change="selectImageFile"
                      ></v-file-input>
                    </v-form>
                  </div>
                  <v-card>
                    <div
                      class="div-img"
                      :style="{backgroundImage: `url('${bgImage}')`}"
                      v-text="bgImage ? '' : '暂无图片'"
                    >
                    </div>
                  </v-card>
                </div>

                <div v-else-if="isNetworkImage">
                  <v-text-field
                    v-model="networkImage"
                    label="输入图片链接"
                    menu-props="auto"
                    outlined
                    @input="changeNetworkImage"
                  ></v-text-field>
                  <v-card>
                    <div
                      class="div-img"
                      :style="{backgroundImage: `url('${networkImage}')`}"
                      v-text="networkImage ? '' : '暂无图片'"
                    >
                    </div>
                  </v-card>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-subheader class="font-weight-bold">设置数据</v-subheader>
        <v-list-item-group>
          <v-list-item @click="$refs.settingFileInput.click()">
            <v-list-item-icon>
              <MyIcon>mdi-file-restore-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>导入设置数据</v-list-item-title>
              <input
                type="file"
                ref="settingFileInput"
                accept=".json"
                style="display: none"
                @change="importSetting"
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="exportSetting">
            <v-list-item-icon>
              <MyIcon>mdi-cloud-upload-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>导出设置数据</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="dialog.deleteSettingDialog = true">
            <v-list-item-icon>
              <MyIcon color="error">mdi-restore</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>重置设置</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-subheader class="font-weight-bold">统计数据</v-subheader>
        <v-list-item-group>
          <v-list-item @click="$refs.statisticFileInput.click()">
            <v-list-item-icon>
              <MyIcon>mdi-file-restore-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>导入统计数据</v-list-item-title>
              <v-list-item-subtitle class="text-caption">选择文件后，将会导出以前的数据，再进行导入操作</v-list-item-subtitle>
              <input
                type="file"
                ref="statisticFileInput"
                accept=".json"
                style="display: none"
                @change="importStatistic"
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="exportStatistic">
            <v-list-item-icon>
              <MyIcon>mdi-cloud-upload-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>导出统计数据</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="dialog.deleteStatisticDialog = true">
            <v-list-item-icon>
              <MyIcon color="error">mdi-delete-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>删除统计数据</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-subheader class="font-weight-bold">其它</v-subheader>

        <v-list-item-group>
          <v-list-item @click="$router.push('/help')">
            <v-list-item-icon>
              <MyIcon>mdi-help-circle-outline</MyIcon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>帮助页面</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>


    <Dialog
      title="是否重置设置？"
      :show.sync="dialog.deleteSettingDialog"
      @confirm="deleteSettingDialogOk"
    >
    </Dialog>

    <Dialog
      title="是否删除统计数据？"
      :show.sync="dialog.deleteStatisticDialog"
      @confirm="deleteStatisticDialogOk"
    >
    </Dialog>

    <v-snackbar
      v-model="snackbar.success.show"
      :value="true"
      :timeout="2000"
      color="success"
      min-width="200"
    >
      <div style="display: flex; align-items: center;">
        <MyIcon>mdi-check-circle-outline</MyIcon>
        <strong class="pl-2"> {{ snackbar.success.msg }}</strong>
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="snackbar.info.show"
      :value="true"
      :timeout="2000"
      min-width="200"
    >
      <div style="display: flex; align-items: center;">
        <strong class="pl-2"> {{ snackbar.info.msg }}</strong>
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="snackbar.error.show"
      :value="true"
      :timeout="5000"
      color="error"
      min-width="200"
    >
      <div style="display: flex; align-items: center;">
        <MyIcon>mdi-close-circle-outline</MyIcon>
        <strong class="pl-2"> {{ snackbar.error.msg }}</strong>
      </div>
    </v-snackbar>
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
import dayjs from 'dayjs'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'

export default {
  name: 'Setting',
  components: {Dialog, MyIcon},
  data() {
    return {
      quoteSourceSelectedItem: '',
      customQuote: '',
      backgroundSelectedItem: '',
      bgColor: '#616161',
      bgImage: '',
      networkImage: '',
      snackbar: {
        success: {
          show: false,
          msg: ''
        },
        error: {
          show: false,
          msg: ''
        },
        info: {
          show: false,
          msg: ''
        }
      },
      dialog: {
        deleteSettingDialog: false,
        deleteStatisticDialog: false
      },
      fileMaxSize: 2_000_000,
      fileRules: [
        value => !value || value.size < this.fileMaxSize || '背景图片大小应该小于' + this.fileMaxSize / 1_000_000 + 'MB！'
      ],
      imageSizeValid: true,
      workingTime: 0,
      restingTime: 0,
      automaticTiming: {},
      enableFocusEfficiency: false,
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
      automaticTimingFromStore: state => state.settings.automaticTiming,
      general: state => state.settings.general
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

      if (this.general) {
        this.enableFocusEfficiency = this.general.enableFocusEfficiency || false
      }

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
          this.infoSnackbar('请重新进入使背景生效')
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
        this.$store.commit('SET_FOCUS_EFFICIENCY', this.enableFocusEfficiency)

        this.successSnackbar('保存成功')
      } catch (err) {
        this.errorSnackbar('保存失败，原因：' + err.message)
      }
    },
    successSnackbar(msg) {
      this.snackbar.success.show = true
      this.snackbar.success.msg = msg
    },
    errorSnackbar(msg) {
      this.snackbar.error.show = true
      this.snackbar.error.msg = msg
    },
    infoSnackbar(msg) {
      this.snackbar.info.show = true
      this.snackbar.info.msg = msg
    },
    deleteSettingDialogOk() {
      this.$store.commit('RESET')
      settings.clearTempCache().then(() => {
        this.initState()
        console.log(this.$store.state)
        this.dialog.deleteSettingDialog = false
        this.successSnackbar('重置成功')
      }).catch(err => this.errorSnackbar('重置失败，原因：' + err.message))
    },
    deleteStatisticDialogOk() {
      statistics.removeStatistic()
        .then(() => {
          this.dialog.deleteStatisticDialog = false
          this.successSnackbar('删除成功')
        })
        .catch(err => this.errorSnackbar('删除失败，原因：' + err.message))
    },
    getKeyByValue(obj, targetVal) {
      for (let [key, val] of Object.entries(obj)) if (val === targetVal) return key
    },
    selectImageFile(file) {
      console.log(file)
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
    exportSetting() {
      settings.exportSettingToJSON(this.$store.state.settings)
        .then(() => this.successSnackbar('导出成功'))
        .catch(err => this.errorSnackbar('导出失败，原因：' + err.message))
    },
    importSetting(e) {
      let file = e.target.files[0]
      if (!file) {
        this.errorSnackbar('请选择文件')
        return
      }
      settings.importJSONToSetting(file).then(res => {
        this.$store.commit('SET_ALL', res.data)
        this.initState()
        this.successSnackbar('导入成功')
      }).catch(err => {
        this.errorSnackbar('导入失败，原因：' + err.message)
      })
      this.clearFileInput(e.target)
    },
    clearFileInput(file) {
      let form = document.createElement('form')
      document.body.appendChild(form)
      form.appendChild(file)
      form.reset()
      document.body.removeChild(form)
    },
    exportStatistic() {
      statistics.exportStatisticToJSON(`relax_statistics_${dayjs().format('YYYY-MM-DD')}.json`)
        .then(() => this.successSnackbar('导出成功'))
        .catch(err => this.errorSnackbar('导出失败，原因：' + err.message))
    },
    importStatistic(e) {
      let file = e.target.files[0]
      if (!file) {
        this.errorSnackbar('请选择文件')
        return
      }
      statistics.exportStatisticToJSON('relax_statistics_back.json').then(() => {
        statistics.importJSONToStatistic(file)
          .then(() => this.successSnackbar('导入成功'))
          .catch(err => this.errorSnackbar('导入失败，原因：' + err.message))
      })
      this.clearFileInput(e.target)
    }
  }
}
</script>

<style lang="sass" scoped>
.div-img
  height: 250px
  background-size: cover
  display: flex
  justify-content: center
  align-items: center
</style>
