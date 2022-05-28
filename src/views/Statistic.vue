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


    <v-tabs centered v-model="tab">
      <v-tab>趋势</v-tab>
      <v-tab>时间线</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-row class="my-3 justify-center">
          <v-chip :color="activeChip === 0 ? 'primary' : ''" style="cursor: pointer; user-select: none;">近7天专注</v-chip>
        </v-row>

        <v-card
          v-show="activeChip === 0"
          flat
          class="ma-auto"
          max-width="1000"
        >
          <v-card-title>
            <MyIcon
              class="mr-12"
              color="primary"
              size="56"
            >
              mdi-laptop
            </MyIcon>
            <v-row align="start">
              <div class="text-caption grey--text text-uppercase">
                平均每天
              </div>
              <div>
                <span
                  class="text-h5 font-weight-black"
                  v-text="minutesAvg || '—'"
                ></span>
                <strong v-if="minutesAvg">M</strong>
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
              最近7天专注时长
            </div>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card
          v-if="isEmpty"
          flat
          class="ma-auto"
          max-width="600">
          <div class="text-center pa-15">暂无数据</div>
        </v-card>
        <v-card
          v-else
          flat
          class="ma-auto"
          max-width="600"
        >
          <v-fade-transition>
            <v-timeline
              align-top
              dense
              v-show="!isCompleted"
            >
              <div v-for="index in 3" :key="index">
                <v-timeline-item
                  class="mb-6"
                >

                  <div>
                    <v-skeleton-loader
                      class=""
                      max-width="300"
                      type="heading"
                    ></v-skeleton-loader>
                  </div>

                  <div>
                    <v-skeleton-loader
                      class="mt-2"
                      max-width="300"
                      type="text"
                    ></v-skeleton-loader>
                  </div>
                </v-timeline-item>

                <v-timeline-item
                  small
                  v-for="j in 3"
                  :key="j"
                >
                  <v-row class="pt-1">
                    <v-col cols="6">
                      <v-skeleton-loader
                        class="mt-1"
                        max-width="150"
                        type="text"
                      ></v-skeleton-loader>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="5" class="text-right">
                      <v-skeleton-loader
                        class="mt-1 float-right"
                        type="chip"
                      ></v-skeleton-loader>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption">
                        <v-skeleton-loader
                          class="mt-1"
                          max-width="50"
                          type="text"
                        ></v-skeleton-loader>
                      </div>
                    </v-col>
                  </v-row>
                </v-timeline-item>
              </div>
            </v-timeline>
          </v-fade-transition>

          <v-timeline
            align-top
            dense
          >
            <div v-for="(value, key, index) in dayGroups" v-if="index < maxLength" :key="index">
              <v-timeline-item
                class="mb-6"
              >

                <div><strong>{{ key }}</strong></div>
                <div>专注 {{ formatMinute(value.workSum) }}，休息 {{ formatMinute(value.restSum) }}</div>
              </v-timeline-item>

              <v-timeline-item
                small
                v-for="(item, j) in value.items"
                :key="j"
                color="grey"
              >
                <v-row class="pt-1">
                  <v-col cols="6">
                    {{ formatTime(item.startTime) }} -
                    {{ formatTimeAddMinute(item.startTime, item.duration) }}
                  </v-col>
                  <v-col cols="5" class="text-right">
                    <strong>{{ item.name }}</strong>&nbsp;
                    <MyIcon v-if="isWork(item.status)">mdi-laptop</MyIcon>
                    <MyIcon v-else>mdi-coffee-outline</MyIcon>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">
                      {{ item.duration }} 分
                    </div>
                  </v-col>
                </v-row>
              </v-timeline-item>
            </div>
          </v-timeline>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import statistics from '@/store/statistics'
import {formatMinute} from '@/util/durations'
import dayjs from 'dayjs'
import {clockStatus} from '@/config/constants'
import MyIcon from '@/components/MyIcon'

export default {
  name: 'Statistic',
  components: {MyIcon},
  data() {
    return {
      dayGroups: {},
      dailyMinutes: [],
      dailyMinuteLabels: [],
      currentPage: 0,
      pageSize: 14,
      isCompleted: false,
      isEmpty: false,
      tab: null,
      activeChip: 0
    }
  },
  computed: {
    maxLength() {
      return Math.min(this.dayGroupsLength, (this.currentPage + 1) * this.pageSize)
    },
    dayGroupsLength() {
      return Object.keys(this.dayGroups).length
    },
    pageTotal() {
      return this.dayGroupsLength / this.pageSize
    },
    minutesAvg() {
      const sum = this.dailyMinutes.reduce((acc, cur) => acc + cur, 0)
      const length = this.dailyMinutes.length - 1
      if (!sum && !length) return 0
      return Math.ceil(sum / length)
    }
  },
  activated() {
    this.initPage()
  },
  methods: {
    initPage() {
      const dateFormat = 'YYYY年MM月DD日'
      statistics.getStatisticData(dateFormat)
        .then(res => {
          const data = res.data
          if (!data || !data.allDayGroups) this.isEmpty = true

          this.dayGroups = data.allDayGroups
          this.dailyMinutes = data.last7daysDurations
          this.dailyMinuteLabels = data.last7daysDurations.map(item => item + 'm')
          this.dailyMinutes.splice(0, 0, 0)
          this.dailyMinuteLabels.splice(0, 0, 'Before')

          this.isCompleted = true
        })

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
    },
    isWork(status) {
      return status === clockStatus.WORK
    }
  }
}
</script>

<style lang="sass" scoped>
#statistic-page
  height: 100%
</style>
