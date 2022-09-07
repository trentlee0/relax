<template>
  <div id="statistic-page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="$router.replace('/')"
        :title="`主页 (${shortcuts.global.HOME})`"
      >
        <MyIcon>mdi-home-outline</MyIcon>
      </v-btn>

      <v-toolbar-title>统计</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>

    <ToTop v-if="isTimelineView"></ToTop>

    <v-tabs centered v-model="tab" @change="tabChangeEvent">
      <v-tab>总览</v-tab>
      <v-tab>专注统计</v-tab>
      <v-tab>专注时间</v-tab>
      <v-tab>时间线</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Overview ref="overview"></Overview>
      </v-tab-item>

      <v-tab-item>
        <FocusTask ref="focusTask"></FocusTask>
      </v-tab-item>

      <v-tab-item>
        <FocusTime ref="focusTime"></FocusTime>
      </v-tab-item>

      <v-tab-item>
        <Timeline ref="timeline"></Timeline>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import MyIcon from '@/components/MyIcon'
import FocusTime from '@/views/statistic/FocusTime'
import Timeline from '@/views/statistic/Timeline'
import Overview from '@/views/statistic/Overview'
import ToTop from '@/components/ToTop'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'
import FocusTask from '@/views/statistic/FocusTask'

export default {
  name: 'Statistic',
  components: {FocusTask, ToTop, Overview, Timeline, FocusTime, MyIcon},
  data() {
    return {
      tab: 0,
      tabLen: 4,
      tabMounts: new Set(),
      isFirstComing: true,
      timelineIndex: 3,
      shortcuts: shortcuts
    }
  },
  created() {
    hotkeys(Object.values(shortcuts.statistic).join(','), 'statistic', (event, handler) => {
      event.preventDefault()
      switch (handler.key) {
        case shortcuts.statistic.LEFT_MOVE:
          this.tab = (this.tab - 1 + this.tabLen) % this.tabLen
          this.tabChangeEvent(this.tab)
          break
        case shortcuts.statistic.RIGHT_MOVE:
          this.tab = (this.tab + 1) % this.tabLen
          this.tabChangeEvent(this.tab)
          break
      }
    })
  },
  mounted() {
    this.tabMounts.add(this.tab)
  },
  activated() {
    if (!this.isFirstComing) {
      this.tabMounts.forEach(tab => {
        switch (tab) {
          case 0:
            this.$refs.overview.refreshData()
            break
          case 1:
            this.$refs.focusTask.refreshData()
            break
          case 2:
            this.$refs.focusTime.refreshData()
            break
          case 3:
            this.$refs.timeline.refreshData()
            this.$refs.timeline.registerEventHandler()
            break
        }
      })
    }
    this.isFirstComing = false
  },
  deactivated() {
    if (this.hasTimeline()) {
      this.$refs.timeline.unregisterEventHandler()
    }
  },
  computed: {
    isTimelineView() {
      return this.tab === this.timelineIndex
    }
  },
  methods: {
    tabChangeEvent(tab) {
      if (this.hasTimeline()) {
        if (tab === this.timelineIndex) {
          this.$refs.timeline.registerEventHandler()
        } else {
          this.$refs.timeline.unregisterEventHandler()
        }
      }
      this.tabMounts.add(tab)
    },
    hasTimeline() {
      return this.tabMounts.has(this.timelineIndex)
    }
  }
}
</script>

<style lang="sass" scoped>
#statistic-page
  height: 100%
</style>
