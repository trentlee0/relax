<template>
  <div id="page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title>统计</v-toolbar-title>

      <v-spacer></v-spacer>
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


    <v-tabs
      v-model="tab"
      centered
    >
      <v-tab
        v-for="item in tabs"
        :key="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <div v-if="!isEmpty">
        <v-tab-item>
          <v-card
            flat
            class="ma-auto"
            max-width="600"
          >
            <v-timeline
              align-top
              dense
            >
              <div v-for="(value, key, i) in dayGroups" :key="i">
                <v-timeline-item
                  class="mb-6"
                >

                  <div><strong>{{ key }}</strong></div>
                  <div>工作了 {{ formatMinute(value.sum) }}</div>
                </v-timeline-item>

                <v-timeline-item
                  small
                  v-for="(item, j) in value.data"
                  :key="j"
                >
                  <v-row class="pt-1">
                    <v-col cols="6">
                      {{ formatTime(item.startTime) }} -
                      {{ formatTimeAddMinute(item.startTime, item.duration) }}
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <strong>{{ item.name }}</strong>&nbsp;
                      <v-icon>mdi-laptop</v-icon>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption">
                        {{ item.duration }} m
                      </div>
                    </v-col>
                  </v-row>
                </v-timeline-item>
              </div>
            </v-timeline>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card
            flat
            class="ma-auto"
            max-width="1000"
          >
            <v-card-title>
              <v-icon
                class="mr-12"
                color="primary"
                size="64"
              >
                mdi-laptop
              </v-icon>
              <v-row align="start">
                <div class="text-caption grey--text text-uppercase">
                  平均每天
                </div>
                <div>
                <span
                  class="text-h3 font-weight-black"
                  v-text="minutesAvg || '—'"
                ></span>
                  <strong v-if="minutesAvg">MIN</strong>
                </div>
              </v-row>
            </v-card-title>
            <v-card-text>
              <v-sheet elevation="2" class="pa-6">
                <v-sparkline
                  :labels="dailyMinuteLabels"
                  :value="dailyMinutes"
                  line-width="1"
                  padding="10"
                  stroke-linecap="round"
                  gradient-direction="top"
                  type="trend"
                  auto-draw
                  auto-line-width
                  label-size="5"
                  smooth
                >
                </v-sparkline>
              </v-sheet>
            </v-card-text>

            <v-card-text>
              <div class="text-h4 font-weight-thin text-center">
                最近7天工作时长
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </div>
      <div v-else>
        <div class="text-center pa-15">暂无数据</div>
      </div>
    </v-tabs-items>
  </div>
</template>

<script>
import statistics from '@/util/statistics'
import {formatMinute} from '@/util/durations'
import dayjs from 'dayjs'

export default {
  name: 'Statistic',
  data() {
    return {
      tab: null,
      tabs: ['时间线', '近7天统计'],
      dayGroups: {},
      dailyMinutes: [],
      dailyMinuteLabels: [],
      isEmpty: true
    }
  },
  computed: {
    minutesAvg() {
      const sum = this.dailyMinutes.reduce((acc, cur) => acc + cur, 0)
      const length = this.dailyMinutes.length - 1
      if (!sum && !length) return 0
      return Math.ceil(sum / length)
    }
  },
  created() {
    const dateFormat = 'YYYY年MM月DD日'
    statistics.listGroupByDay(dateFormat)
      .then(data => {
        if (data) this.isEmpty = false

        this.dayGroups = data
        const before7day = dayjs().subtract(7, 'd').format(dateFormat)
        this.dailyMinutes = Object.keys(this.dayGroups)
          .filter(date => date > before7day)
          .map(e => this.dayGroups[e].sum)
        this.dailyMinuteLabels = this.dailyMinutes.map(e => e + 'min')
        this.dailyMinuteLabels.splice(0, 0, 'Before')
        this.dailyMinutes.splice(0, 0, 0)
      })
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'overlay'
  },
  methods: {
    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm')
    },
    formatTimeAddMinute(timestamp, duration) {
      return dayjs(timestamp).add(duration, 'm').format('HH:mm')
    },
    formatMinute(minute) {
      return formatMinute(minute)
    },
    back() {
      this.$router.replace('/')
    },
    toTop() {
      scrollTo(0, 0)
    }
  }
}
</script>

<style scoped>

</style>
