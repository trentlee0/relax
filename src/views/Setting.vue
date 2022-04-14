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
                v-model="quoteSourceSelectedItem"
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
                      :gradient="!bgImage || !bgImage.trim() ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)' : ''"
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
                  开始确认
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
    </div>
  </div>
</template>

<script>
import {
  backgroundChinese,
  backgroundType,
  quoteType,
  quoteChinese
} from '@/store/constants'
import {isUTools} from '@/util/platforms'
import Dialog from '@/components/Dialog'
import settings from '@/store/settings'
import statistics from '@/store/statistics'
import {arrayBufferToBase64ImagePNG} from '@/util/requests'
import {mapState} from 'vuex'

export default {
  name: 'Setting',
  components: {Dialog},
  data() {
    return {
      quoteSourceSelectedItem: '',
      customQuote: '',
      backgroundSelectedItem: '',
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
      imageSizeValid: true,
      importSettingFile: null,
      importStatisticFile: null
    }
  },
  computed: {
    ...mapState({
      background: state => state.background,
      quote: state => state.quote,
      workingTime: state => state.workingTime / 60,
      restingTime: state => state.restingTime / 60,
      notification: state => state.notification
    }),
    quoteSourceItems() {
      return Object
        .values(quoteType)
        .filter(value => isUTools() ? true : value !== quoteType.SHANBAY)
        .map(value => quoteChinese[value])
    },
    backgroundTypeItems() {
      return Object
        .values(backgroundType)
        .filter(value => isUTools() ? true : value !== backgroundType.SHANBAY)
        .map(value => backgroundChinese[value])
    },
    isImage() {
      return this.backgroundSelectedItem === backgroundChinese.image
    },
    isColor() {
      return this.backgroundSelectedItem === backgroundChinese.color
    },
    isCustomQuote() {
      return this.quoteSourceSelectedItem === quoteChinese.custom
    },
    isUtools() {
      return isUTools()
    }
  },
  created() {
    this.initState()
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'auto'
  },
  methods: {
    initState() {
      this.backgroundSelectedItem = backgroundChinese[this.background.type]
      this.quoteSourceSelectedItem = quoteChinese[this.quote.type]

      if (this.background.type === backgroundType.COLOR) this.bgColor = this.background.val

      settings.getAttachment(backgroundType.IMAGE)
        .then(res => {
          this.bgImage = res.data
        })
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
      settings.removeAttachment(backgroundType.BING).then(() => {
        settings.removeAttachment(backgroundType.SHANBAY).then(() => {
          settings.removeAttachment(backgroundType.UNSPLASH).then(() => {
            settings.removeAttachment(backgroundType.IMAGE).then(() => {
              this.initState()
              this.deleteSettingDialog = false
              this.showSuccessSnackBar('删除成功')
            }).catch(err => this.showErrorSnackBar('删除失败，原因：' + err.message))
          }).catch(err => this.showErrorSnackBar('删除失败，原因：' + err.message))
        }).catch(err => this.showErrorSnackBar('删除失败，原因：' + err.message))
      }).catch(err => this.showErrorSnackBar('删除失败，原因：' + err.message))
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
