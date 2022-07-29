<template>
  <div>
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
  </div>
</template>

<script>
import statistics from '@/store/statistics'
import dayjs from 'dayjs'
import MyIcon from '@/components/MyIcon'
import {formatMinute} from '@/util/durations'
import {clockStatus} from '@/config/constants'

export default {
  name: 'Timeline',
  components: {MyIcon},
  data() {
    return {
      dayGroups: {},
      currentPage: 0,
      pageSize: 14,
      isCompleted: false,
      isEmpty: false
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
      statistics.getEveryday().then(res => {
        const data = res.data
        if (!data || !data.allDayGroups) this.isEmpty = true

        this.dayGroups = data.allDayGroups
        this.isCompleted = true
      })
    },
    registerEventHandler() {
      window.addEventListener('scroll', this.scrollHandler)
      window.addEventListener('resize', this.resizeHandler)
    },
    unregisterEventHandler() {
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
      return formatMinute(minute)
    },
    isWork(status) {
      return status === clockStatus.WORK
    }
  }
}
</script>

<style scoped>

</style>
