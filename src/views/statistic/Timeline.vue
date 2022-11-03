<template>
  <div>
    <v-card
      v-if="isEmpty"
      flat
      class="ma-auto"
      max-width="600"
    >
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
        <div v-for="(minutes, date, index) in dayGroups" v-if="index < maxLength" :key="index">
          <v-timeline-item
            class="mb-6"
          >
            <div>
              <span class="font-weight-bold">{{ date === today ? '今天' : (date === yesterday ? '昨天' : date) }}</span>
            </div>
            <div>
              <span class="text-body-2 text--secondary">
                专注 {{ formatMinute(minutes.workSum) }}，休息 {{ formatMinute(minutes.restSum) }}
              </span>
            </div>
          </v-timeline-item>

          <v-timeline-item
            small
            v-for="(item, j) in minutes.items"
            :key="j"
            color="grey"
          >
            <v-row class="pt-1">
              <v-col cols="6">
                {{ formatTime(item.startTime) }} -
                {{ item.endTime ? formatTime(item.endTime) : formatTimeAddMinute(item.startTime, item.duration) }}
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
  </div>
</template>

<script>
import statistics from '@/api/statistics'
import dayjs from 'dayjs'
import MyIcon from '@/components/MyIcon'
import {formatDurationMinutes} from '@/util/date'
import {ClockStatus} from '@/common/constant'

export default {
  name: 'Timeline',
  components: {MyIcon},
  data() {
    return {
      dayGroups: {},
      currentPage: 0,
      pageSize: 14,
      isCompleted: false,
      isEmpty: false,
      today: '',
      yesterday: ''
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
    }
  },
  mounted() {
    this.refreshData()
    this.resizeHandler()
    this.registerEventHandler()
  },
  methods: {
    refreshData() {
      console.log('timeline refresh')
      const format = 'YYYY年MM月DD日'
      statistics.getDailyItems(format).then(({data}) => {
        this.today = dayjs().format(format)
        this.yesterday = dayjs().subtract(1, 'day').format(format)
        this.isEmpty = data.isEmpty
        this.dayGroups = data.data
        this.isCompleted = true
      })
    },
    registerEventHandler() {
      console.log('register event handler: scroll, resize')
      window.addEventListener('scroll', this.scrollHandler)
      window.addEventListener('resize', this.resizeHandler)
    },
    unregisterEventHandler() {
      console.log('unregister event handler: scroll, resize')
      window.removeEventListener('scroll', this.scrollHandler)
      window.removeEventListener('resize', this.resizeHandler)
    },
    scrollHandler() {
      console.log('scroll')
      let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      let scrollBottom = scrollHeight - windowHeight - scrollTop
      if (scrollBottom <= 0) {
        if (this.currentPage < this.pageTotal) this.currentPage++
      }
    },
    resizeHandler() {
      console.log('resize')
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      this.pageSize = Math.ceil(windowHeight / 190)
    },
    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm')
    },
    formatTimeAddMinute(timestamp, duration) {
      return dayjs(timestamp).add(duration, 'm').format('HH:mm')
    },
    formatMinute(minute) {
      return formatDurationMinutes(minute)
    },
    isWork(status) {
      return status === ClockStatus.WORK
    }
  }
}
</script>

<style scoped>

</style>
