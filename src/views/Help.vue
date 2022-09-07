<template>
  <div id="help-page">
    <v-toolbar flat>
      <v-btn
        icon
        title="关闭"
        @click="$router.back()"
      >
        <MyIcon>mdi-close-thick</MyIcon>
      </v-btn>

      <v-toolbar-title>帮助</v-toolbar-title>
    </v-toolbar>

    <v-subheader>设置 —— 帮助页面</v-subheader>

    <v-card>
      <v-card-title>快捷键</v-card-title>

      <v-card-text>
        <div v-for="(table, index) in tables">
          <div :style="{marginTop: index === 0 ? '' : '20px', marginBottom: '5px'}">
            <strong class="text--primary">{{ table[0] }}</strong>
          </div>
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left" style="width: 50%">
                  操作
                </th>
                <th class="text-left">
                  快捷键
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                v-for="item in table[1]"
                :key="item.action"
              >
                <td>{{ item.action }}</td>
                <td>{{ item.keyboard }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MyIcon from '@/components/MyIcon'
import shortcuts from '@/common/shortcuts'
import hotkeys from 'hotkeys-js'

export default {
  name: 'Help',
  components: {MyIcon},
  data() {
    return {
      tables: [
        [
          '全局',
          [
            {action: '切换到计时器界面', keyboard: shortcuts.global.HOME},
            {action: '切换到设置界面', keyboard: shortcuts.global.SETTING},
            {action: '切换到统计界面', keyboard: shortcuts.global.STATISTIC}
          ]
        ],
        [
          '计时器界面',
          [
            {action: '开始/暂停计时', keyboard: shortcuts.home.START_TIMER},
            {action: '结束计时', keyboard: shortcuts.home.END_TIMER},
            {action: '切换计时器', keyboard: shortcuts.home.CHANGE_TIMER},
            {action: '打开/关闭待办事项界面', keyboard: shortcuts.home.TODO},
            {action: '打开/关闭背景音界面', keyboard: shortcuts.home.BACKGROUND_MUSIC}
          ]
        ],
        [
          '背景音界面',
          [
            {action: '向左切换音频', keyboard: shortcuts.audio.LEFT_MOVE},
            {action: '向右切换音频', keyboard: shortcuts.audio.RIGHT_MOVE},
            {action: '增加 5% 音量', keyboard: shortcuts.audio.UP_MOVE},
            {action: '减少 5% 音量', keyboard: shortcuts.audio.DOWN_MOVE}
          ]
        ],
        [
          '统计界面',
          [
            {action: '向左切换标签', keyboard: shortcuts.statistic.LEFT_MOVE},
            {action: '向右切换标签', keyboard: shortcuts.statistic.RIGHT_MOVE}
          ]
        ],
        [
          '设置界面',
          [
            {action: '保存设置', keyboard: shortcuts.setting.SAVE}
          ]
        ]
      ]
    }
  }
}
</script>

<style scoped>

</style>
