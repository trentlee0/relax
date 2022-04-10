<template>
  <div id="page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title>设置</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        icon
        title="保存"
        @click="save"
      >
        <v-icon>mdi-content-save-outline</v-icon>
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
    >
      <v-icon dark>
        mdi-arrow-up
      </v-icon>
    </v-btn>

    <Dialog
      title="是否删除设置数据？"
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
      <v-icon>mdi-check-circle-outline</v-icon>
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
              工作时长：{{ workingTime }} 分
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
        <v-subheader class="font-weight-bold">通知</v-subheader>

        <v-list-item>
          <v-switch
            v-model="notification.whenEndOfWorkingTime"
            label="工作结束发送通知"
          ></v-switch>
        </v-list-item>

        <v-list-item>
          <v-switch
            v-model="notification.beforeEndOfWorkingTime"
            label="工作结束前 15 秒发送通知"
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
            <v-col cols="6">
              <v-select
                v-model="quoteSourceItem"
                :items="quoteSourceItems"
                menu-props="auto"
                solo
              ></v-select>
            </v-col>
            <v-col cols="6">
              <div v-if="isCustomQuote">
                <v-text-field
                  label="引言"
                  v-model="customQuote"
                  solo
                ></v-text-field>
              </div>
            </v-col>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-subheader class="pl-0">背景</v-subheader>

            <v-col cols="12">
              <v-select
                v-model="backgroundItem"
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
                      v-model="valid"
                      lazy-validation
                    >
                      <v-file-input
                        :rules="rules"
                        accept="image/png"
                        prepend-icon="mdi-file-image"
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
                      :gradient="!bgImage.trim() ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)' : ''"
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
        <v-subheader class="font-weight-bold">删除</v-subheader>

        <v-list-item>
          <v-list-item-content>
            <v-btn class="mt-2" large color="error" @click="deleteSetting">
              删除设置数据
            </v-btn>

            <v-btn class="mt-5" large color="error" @click="deleteStatistic">
              删除统计数据
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
        <v-subheader class="font-weight-bold">导出</v-subheader>

        <v-list-item>
          <v-list-item-content>
            <v-btn class="mt-2" color="primary" large @click="exportSetting">
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
        <v-subheader class="font-weight-bold">导入</v-subheader>

        <v-list-item>
          <v-list-item-content>
            <v-file-input
              accept=".json"
              label="选择导入的设置数据文件"
              @change="importSetting"
            ></v-file-input>

            <v-file-input
              accept=".json"
              label="选择导入的统计数据文件"
              @change="importStatistic"
            ></v-file-input>
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
  quoteChinese, defaultSetting
} from '@/util/constants'
import {isUtools} from '@/util/platforms'
import storages from '@/util/storages'
import Dialog from '@/components/Dialog'
import statistics from '@/util/statistics'
import {arrayBufferToBase64ImagePNG} from '@/util/requests'

export default {
  name: 'Setting',
  components: {Dialog},
  data() {
    return {
      workingTime: 45,
      restingTime: 5,
      notification: {
        whenEndOfWorkingTime: true,
        beforeEndOfWorkingTime: false,
        whenEndOfRestingTime: true
      },
      quoteSourceItems: [
        quoteChinese[quoteType.HITOKOTO],
        quoteChinese[quoteType.CUSTOM]
      ],
      quoteSourceItem: '',
      customQuote: '',
      backgroundTypeItems: [
        backgroundChinese[backgroundType.UNSPLASH],
        backgroundChinese[backgroundType.BING],
        backgroundChinese[backgroundType.IMAGE],
        backgroundChinese[backgroundType.COLOR]
      ],
      backgroundItem: '',
      bgColor: '',
      bgImage: '',
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
      valid: true
    }
  },
  computed: {
    isImage() {
      return this.backgroundItem === backgroundChinese.image
    },
    isColor() {
      return this.backgroundItem === backgroundChinese.color
    },
    isCustomQuote() {
      return this.quoteSourceItem === quoteChinese.custom
    },
    isUtools() {
      return isUtools()
    }
  },
  created() {
    this.initData()
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'auto'
  },
  methods: {
    initData() {
      if (isUtools()) {
        this.quoteSourceItems.splice(0, 0, quoteChinese[quoteType.SHANBAY])
        this.backgroundTypeItems.splice(0, 0, backgroundChinese[backgroundType.SHANBAY])
      }

      if (this.$store.getters.getBackground) {
        this.backgroundItem = backgroundChinese[this.$store.getters.getBackground.type]
      }

      if (this.$store.getters.getBackgrounds) {
        this.bgColor = this.$store.getters.getBackgrounds.color.val
        this.bgImage = this.$store.getters.getBackgrounds.image.val
      }

      if (this.$store.getters.getQuoteSelected) {
        this.quoteSourceItem = quoteChinese[this.$store.getters.getQuoteSelected]
      }

      if (this.$store.getters.getCustomQuote) {
        this.customQuote = this.$store.getters.getCustomQuote.val
      }

      if (this.$store.getters.getNotification) {
        this.notification = this.$store.getters.getNotification
      }

      if (this.$store.getters.getWorkingTime) {
        this.workingTime = this.$store.getters.getWorkingTime / 60
      }

      if (this.$store.getters.getRestingTime) {
        this.restingTime = this.$store.getters.getRestingTime / 60
      }
    },
    back() {
      this.$router.replace('/')
    },
    save() {
      if (this.backgroundItem) {
        switch (this.getKeyByValue(backgroundChinese, this.backgroundItem)) {
          case backgroundType.COLOR:
            this.$store.commit('SET_BACKGROUND_SELECTED', backgroundType.COLOR)
            this.$store.commit('SET_BACKGROUND_COLOR', this.bgColor)
            break
          case backgroundType.IMAGE:
            this.$store.commit('SET_BACKGROUND_SELECTED', backgroundType.IMAGE)
            this.$store.commit('SET_BACKGROUND_IMAGE', this.bgImage)
            break
          case backgroundType.BING:
            this.$store.commit('SET_BACKGROUND_SELECTED', backgroundType.BING)
            break
          case backgroundType.SHANBAY:
            this.$store.commit('SET_BACKGROUND_SELECTED', backgroundType.SHANBAY)
            break
          default:
            this.$store.commit('SET_BACKGROUND_SELECTED', backgroundType.UNSPLASH)
        }
      }

      if (this.quoteSourceItem) {
        switch (this.getKeyByValue(quoteChinese, this.quoteSourceItem)) {
          case quoteType.CUSTOM:
            this.$store.commit('SET_QUOTE_SELECTED', quoteType.CUSTOM)
            this.$store.commit('SET_QUOTE_CUSTOM', this.customQuote)
            break
          case quoteType.SHANBAY:
            this.$store.commit('SET_QUOTE_SELECTED', quoteType.SHANBAY)
            break
          default:
            this.$store.commit('SET_QUOTE_SELECTED', quoteType.HITOKOTO)
        }
      }

      if (this.workingTime) {
        this.$store.commit('SET_WORKING_TIME', this.workingTime * 60)
      }
      if (this.restingTime) {
        this.$store.commit('SET_RESTING_TIME', this.restingTime * 60)
      }
      if (this.notification) {
        this.$store.commit('SET_NOTIFICATION', this.notification)
      }

      this.showSuccessSnackBar('保存成功')
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
      storages.removeSetting()
      storages.initData()
      this.$store.commit('SET_ALL', defaultSetting)
      this.initData()
      this.showSuccessSnackBar('删除成功')
      this.deleteSettingDialog = false
    },
    deleteStatistic() {
      this.deleteStatisticDialog = true
    },
    deleteStatisticDialogOk() {
      statistics.removeStatistic()
      this.showSuccessSnackBar('删除成功')
      this.deleteStatisticDialog = false
    },
    toTop() {
      scrollTo(0, 0)
    },
    getKeyByValue(obj, targetVal) {
      for (let [key, val] of Object.entries(obj)) {
        if (val === targetVal) return key
      }
    },
    selectImageFile(file) {
      if (!file) return
      let reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = (e) => {
        if (this.valid) {
          this.bgImage = arrayBufferToBase64ImagePNG(reader.result)
        }
      }
    },
    clearImageFile() {
      this.bgImage = ' '
    },
    exportSetting() {
      storages.exportSettingToJSON(this.$store.getters.getAll)
        .then(res => this.showSuccessSnackBar('导出成功'))
        .catch(err => {
          this.showErrorSnackBar('导出失败')
          console.error(err)
        })
    },
    importSetting(file) {
      if (!file) return
      storages.importJSONToSetting(file)
        .then(res => {
          this.$store.commit('SET_ALL', res.data)
          this.initData()
          this.showSuccessSnackBar('导入成功')
        })
        .catch(err => {
          this.showErrorSnackBar('导入失败')
          console.error(err)
        })
    },
    exportStatistic() {
      statistics.exportStatisticToJSON()
        .then(res => this.showSuccessSnackBar('导出成功'))
        .catch(err => {
          this.showErrorSnackBar('导出失败')
          console.error(err)
        })
    },
    importStatistic(file) {
      if (!file) return
      statistics.importJSONToStatistic(file)
        .then(res => this.showSuccessSnackBar('导入成功'))
        .catch(err => {
          this.showErrorSnackBar('导入失败')
          console.error(err)
        })
    }
  }
}
</script>

<style scoped>
</style>
