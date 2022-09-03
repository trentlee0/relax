import {isMacOS} from '@/util/common'

export default {
  global: {
    HOME: 'F',
    STATISTIC: 'G',
    SETTING: ','
  },
  home: {
    CHANGE_TIMER: 'C',
    START_TIMER: 'S',
    END_TIMER: 'E',
    TODO: 'T',
    BACKGROUND_MUSIC: 'B'
  },
  audio: {
    UP_MOVE: 'Up',
    DOWN_MOVE: 'Down',
    LEFT_MOVE: 'Left',
    RIGHT_MOVE: 'Right'
  },
  statistic: {
    LEFT_MOVE: 'Left',
    RIGHT_MOVE: 'Right'
  },
  setting: {
    SAVE: isMacOS() ? '⌘+S' : 'Ctrl+S'
  }
}
