import Vue from 'vue'
import {
  mdiArrowRightDropCircle,
  mdiVolumeOff,
  mdiVolumeMute,
  mdiVolumeHigh,
  mdiPlusCircle,
  mdiViewDashboardOutline,
  mdiCogOutline,
  mdiFormatListChecks,
  mdiLaptop,
  mdiCoffeeOutline,
  mdiRotate3dVariant,
  mdiPauseCircle,
  mdiArrowLeft,
  mdiContentSaveOutline,
  mdiArrowUp,
  mdiCheckCircleOutline,
  mdiFileImage,
  mdiPaperclip,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiChevronDown,
  mdiArchiveCheckOutline,
  mdiMenuDown,
  mdiCropSquare
} from '@mdi/js'
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {dark: false},
  icons: {
    iconfont: 'mdi',
    values: {
      'mdi-volume-off': mdiVolumeOff,
      'mdi-volume-mute': mdiVolumeMute,
      'mdi-volume-high': mdiVolumeHigh,
      'mdi-plus-circle': mdiPlusCircle,
      'mdi-view-dashboard-outline': mdiViewDashboardOutline,
      'mdi-cog-outline': mdiCogOutline,
      'mdi-format-list-checks': mdiFormatListChecks,
      'mdi-laptop': mdiLaptop,
      'mdi-coffee-outline': mdiCoffeeOutline,
      'mdi-rotate-3d-variant': mdiRotate3dVariant,
      'mdi-pause-circle': mdiPauseCircle,
      'mdi-arrow-right-drop-circle': mdiArrowRightDropCircle,
      'crop-square': mdiCropSquare,
      'mdi-arrow-left': mdiArrowLeft,
      'mdi-content-save-outline': mdiContentSaveOutline,
      'mdi-arrow-up': mdiArrowUp,
      'mdi-check-circle-outline': mdiCheckCircleOutline,
      'mdi-file-image': mdiFileImage,
      'mdi-close-box-multiple': mdiArchiveCheckOutline,
      checkboxOn: mdiCheckboxMarked,
      checkboxOff: mdiCheckboxBlankOutline,
      file: mdiPaperclip,
      expand: mdiChevronDown,
      dropdown: mdiMenuDown
    }
  }
})
