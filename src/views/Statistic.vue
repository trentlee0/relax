<template>
  <div id="statistic-page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="back"
      >
        <MyIcon>mdi-arrow-left</MyIcon>
      </v-btn>

      <v-toolbar-title>统计</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>

    <ToTop v-if="isTimelineView"></ToTop>

    <v-tabs centered v-model="tab" @change="tabChangeEvent">
      <v-tab>总览</v-tab>
      <v-tab>专注时间</v-tab>
      <v-tab>时间线</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Overview ref="overview"></Overview>
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

export default {
  name: 'Statistic',
  components: {ToTop, Overview, Timeline, FocusTime, MyIcon},
  data() {
    return {
      tab: 0,
      tabMounts: new Set(),
      isFirst: true
    }
  },
  mounted() {
    this.tabMounts.add(0)
  },
  activated() {
    window.document.documentElement.style.overflowY = 'overlay'
    if (!this.isFirst) {
      this.tabMounts.forEach(tab => {
        switch (tab) {
          case 0:
            this.$refs.overview.refreshData()
            break
          case 1:
            this.$refs.focusTime.refreshData()
            break
          case 2:
            this.$refs.timeline.refreshData()
            this.$refs.timeline.registerEventHandler()
            break
        }
      })
    }
    this.isFirst = false
  },
  deactivated() {
    if (this.tabMounts.has(2)) {
      this.$refs.timeline.unregisterEventHandler()
    }
  },
  computed: {
    isTimelineView() {
      return this.tab === 2
    }
  },
  methods: {
    tabChangeEvent(tab) {
      if (this.tabMounts.has(2)) {
        this.$refs.timeline.unregisterEventHandler()
      }
      this.tabMounts.add(tab)
    },
    back() {
      this.$router.replace('/')
    }
  }
}
</script>

<style lang="sass" scoped>
#statistic-page
  height: 100%
</style>
