<template>
  <div id="page">
    <v-toolbar flat>
      <v-btn
        icon
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title>工作统计</v-toolbar-title>

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
            max-width="600">

            <v-timeline
              align-top
              dense
            >
              <div v-for="(value, i) in dayGroupsPagination" :key="i">
                <v-timeline-item
                  class="mb-6"
                >

                  <div><strong>{{ value[0] }}</strong></div>
                  <div>工作了 {{ formatMinute(value[1].sum) }}</div>
                </v-timeline-item>

                <v-timeline-item
                  small
                  v-for="(item, j) in value[1].data"
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
import statistics from '@/store/statistics'
import {formatMinute} from '@/util/durations'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export default {
  name: 'Statistic',
  data() {
    return {
      tab: null,
      tabs: ['时间线', '近7天统计'],
      dayGroups: [],
      dailyMinutes: [],
      dailyMinuteLabels: [],
      isEmpty: true,
      currentPage: 0,
      pageSize: 7
    }
  },
  computed: {
    dayGroupsPagination() {
      return this.dayGroups.slice(0, Math.min(this.dayGroups.length, (this.currentPage + 1) * this.pageSize))
    },
    pageTotal() {
      return this.dayGroups.length / this.pageSize
    },
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
      .then(res => {
        const data = res.data
        if (data) this.isEmpty = false

        this.dayGroups = Object.entries(data)
          .sort((a, b) => a[0] > b[0] ? 1 : -1)
          .reverse()

        const before7day = dayjs().subtract(7, 'd')
        this.dailyMinutes = new Array(7).fill(0, 0, 7)
        this.dayGroups
          .slice(0, 7)
          .forEach((value) => {
            const i = dayjs(value[0], dateFormat).diff(before7day, 'day')
            this.dailyMinutes[i] = value[1].sum
          })
        this.dailyMinuteLabels = this.dailyMinutes.map(e => e + 'min')
        this.dailyMinuteLabels[0] = 'Before'

        this.dailyMinutes.splice(0, 0, 0)
        this.dailyMinuteLabels.splice(0, 0, 'Before')
      })
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'overlay'

    window.addEventListener('scroll', () => {
      let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      let scrollBottom = scrollHeight - windowHeight - scrollTop
      if (scrollBottom <= 0) {
        if (this.currentPage < this.pageTotal) this.currentPage++
      }
    })
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
