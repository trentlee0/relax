<template>
  <div id="setting-page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="back"
      >
        <MyIcon>mdi-arrow-left</MyIcon>
      </v-btn>

      <v-toolbar-title>设置</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        icon
        title="保存"
        @click="save"
      >
        <MyIcon>mdi-content-save-outline</MyIcon>
      </v-btn>
    </v-toolbar>

    <v-btn
      class="mx-2"
      fab
      dark
      large
      fixed
      right
      bottom
      color="primary"
      @click="toTop"
      title="返回顶部"
    >
      <MyIcon dark>
        mdi-arrow-up
      </MyIcon>
    </v-btn>

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
      color="success"
    >
      <MyIcon>mdi-check-circle-outline</MyIcon>
      <strong class="pl-2"> {{ successSnackbarMsg }}</strong>
    </v-snackbar>

    <v-snackbar
      v-model="errorSnackbar"
      :value="true"
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
          <v-list-item-title style="height: 95px">
            <v-subheader class="pl-0">
              专注时长：{{ workingTime }} 分
            </v-subheader>
            <v-slider
              v-model="workingTime"
              min="1"
              max="120"
              thumb-label
            ></v-slider>
          </v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-title style="height: 95px">
            <v-subheader class="pl-0">
              休息时长：{{ restingTime }} 分
            </v-subheader>
            <v-slider
              v-model="restingTime"
              min="1"
              max="30"
              thumb-label
            ></v-slider>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider color=""></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">提醒</v-subheader>

        <v-list-item>
          <v-switch
            v-model="notification.whenEndOfWorkingTime"
            label="专注结束发送通知"
          ></v-switch>
        </v-list-item>

        <v-list-item v-if="isUTools">
          <v-switch
            v-model="notification.showWindowWhenEndOfWorkingTime"
            label="专注结束显示主窗口"
          ></v-switch>
        </v-list-item>

        <v-list-item>
          <v-switch
            v-model="notification.beforeEndOfWorkingTime"
            label="专注结束前 15 秒发送通知"
          ></v-switch>
        </v-list-item>
        <v-list-item>
          <v-switch
            v-model="notification.whenEndOfRestingTime"
            label="休息结束发送通知"
          ></v-switch>
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
            <v-col cols="12">
              <v-select
                v-model="quoteSourceSelectedItem"
                :items="quoteSourceItems"
                menu-props="auto"
                solo
              ></v-select>
            </v-col>
            <v-col cols="12" v-if="isCustomQuote">
              <v-text-field
                label="请输入引言"
                autofocus
                v-model="customQuote"
                solo
              ></v-text-field>
            </v-col>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">背景来源</v-subheader>

            <v-col cols="12">
              <v-select
                v-model="backgroundSelectedItem"
                :items="backgroundTypeItems"
                menu-props="auto"
                solo
              ></v-select>
            </v-col>

            <v-list-item-subtitle>
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
                <v-col>
                  <div>
                    <v-form
                      ref="form"
                      v-model="imageSizeValid"
                      lazy-validation
                    >
                      <v-file-input
                        :rules="rules"
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
                </v-col>
              </div>

              <div v-else-if="isNetworkImage">
                <v-col>
                  <v-text-field
                    v-model="networkImage"
                    label="图片地址"
                    menu-props="auto"
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
                </v-col>
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">导入</v-subheader>
        <small class="ml-5 text-caption">* 会覆盖原数据</small>
        <v-list-item>
          <v-list-item-content>
            <v-row>
              <v-col cols="6">
                <v-file-input
                  accept=".json"
                  outlined
                  dense
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
      </v-list>


      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">导出</v-subheader>

        <v-list-item>
          <v-list-item-content class="ml-2 mr-2">
            <v-btn color="primary" large @click="exportSetting">
              导出设置数据
            </v-btn>

            <v-btn class="mt-5" color="primary" large @click="exportStatistic">
              导出统计数据
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        flat
        subheader
        three-line
      >
        <v-subheader class="font-weight-bold">删除</v-subheader>

        <v-list-item>
          <v-list-item-content class="ml-2 mr-2">
            <v-btn large color="error" @click="deleteSetting">
              重置设置
            </v-btn>

            <v-btn class="mt-5" large color="error" @click="deleteStatistic">
              删除统计数据
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import {
  backgroundChinese,
  backgroundType,
  quoteType,
  quoteChinese, crossDomainBackground, crossDomainQuote
} from '@/config/constants'
import {isUTools} from '@/util/platforms'
import Dialog from '@/components/Dialog'
import settings from '@/store/settings'
import statistics from '@/store/statistics'
import {arrayBufferToBase64ImagePNG} from '@/util/requests'
import {mapState} from 'vuex'
import MyIcon from '@/components/MyIcon'

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
      successSnackbar: false,
      successSnackbarMsg: '',
      errorSnackbar: false,
      errorSnackbarMsg: '',
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
      restingTime: 0
    }
  },
  computed: {
    ...mapState({
      background: state => state.background,
      quote: state => state.quote,
      workingTimeFromStore: state => state.workingTime / 60,
      restingTimeFromStore: state => state.restingTime / 60,
      notification: state => state.notification
    }),
    quoteSourceItems() {
      return Object
        .values(quoteType)
        .filter(value => isUTools() ? true : crossDomainQuote.indexOf(value) === -1)
        .map(value => quoteChinese[value])
    },
    backgroundTypeItems() {
      return Object
        .values(backgroundType)
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
  activated() {
    this.initPage()
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

      if (this.$store.state.quote.val) this.customQuote = this.$store.state.quote.val

      if (this.background.val) {
        if (this.background.type === backgroundType.COLOR)
          this.bgColor = this.background.val
        else if (this.background.type === backgroundType.NETWORK)
          this.networkImage = this.background.val
      }

      settings.getTempCache(backgroundType.IMAGE)
        .then(res => this.bgImage = res.data)
    },
    back() {
      this.$router.replace('/')
    },
    save() {
      try {
        const selectedQuoteType = this.getKeyByValue(quoteChinese, this.quoteSourceSelectedItem)
        this.$store.commit('UPDATE_QUOTE', [selectedQuoteType, this.customQuote])

        const selectedBackgroundType = this.getKeyByValue(backgroundChinese, this.backgroundSelectedItem)
        switch (selectedBackgroundType) {
          case backgroundType.COLOR:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.bgColor])
            break
          case backgroundType.IMAGE:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.bgImage])
            break
          case backgroundType.NETWORK:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType, this.networkImage])
            break
          default:
            this.$store.commit('UPDATE_BACKGROUND', [selectedBackgroundType])
        }

        this.$store.commit('SET_WORKING_TIME', this.workingTime * 60)
        this.$store.commit('SET_RESTING_TIME', this.restingTime * 60)
        this.$store.commit('SET_NOTIFICATION', this.notification)

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
      let reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => {
        if (this.imageSizeValid) this.bgImage = arrayBufferToBase64ImagePNG(reader.result)
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
      settings.exportSettingToJSON(this.$store.getters.getAll)
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
    },
    exportStatistic() {
      statistics.exportStatisticToJSON()
        .then(() => this.showSuccessSnackBar('导出成功'))
        .catch(err => this.showErrorSnackBar('导出失败，原因：' + err.message))
    },
    importStatistic() {
      let file = this.importStatisticFile
      if (!file) {
        this.showErrorSnackBar('请选择文件')
        return
      }
      statistics.importJSONToStatistic(file)
        .then(() => this.showSuccessSnackBar('导入成功'))
        .catch(err => this.showErrorSnackBar('导入失败，原因：' + err.message))
    }
  }
}
</script>

<style scoped>
</style>
