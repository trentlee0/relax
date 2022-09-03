<template>
  <v-card
    flat
    class="ma-auto"
    max-width="1000"
  >
    <v-card-text>
      <v-row style="height: 75px;">
        <v-col :hidden="!isCustomDateFilter">
          <v-menu
            v-model="startTimeMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="startTime"
                label="开始日期"
                :prepend-icon="$vuetify.icons.values['mdi-calendar']"
                v-bind="attrs"
                v-on="on"
                readonly
                dense
                outlined
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="startTime"
              @input="startTimePickerHandler"
              no-title
              scrollable
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col :hidden="!isCustomDateFilter">
          <v-menu
            v-model="endTimeMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="endTime"
                label="结束日期"
                :prepend-icon="$vuetify.icons.values['mdi-calendar']"
                v-bind="attrs"
                v-on="on"
                readonly
                dense
                outlined
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="endTime"
              @input="endTimePickerHandler"
              no-title
              scrollable
            ></v-date-picker>
          </v-menu>
        </v-col>

        <v-spacer v-show="!isCustomDateFilter"></v-spacer>
        <v-spacer v-show="!isCustomDateFilter"></v-spacer>

        <v-spacer></v-spacer>
        <v-spacer></v-spacer>

        <v-col style="height: 20px;">
          <v-select
            :items="items"
            dense
            v-model:value="item"
            solo
            @change="selectChangeEvent"
          ></v-select>
        </v-col>
      </v-row>
      <v-chart :theme="chartTheme" autoresize :option="option" style="height: 335px"></v-chart>
    </v-card-text>
    <div class="text--primary font-weight-light text-center">
      专注时长 {{ workTimesSum }} 分钟
    </div>
  </v-card>
</template>

<script>
import dayjs from 'dayjs'
import statistics from '@/api/statistics'
import {
  endOfDay,
  startAndEndOfDay,
  startAndEndOfMonth,
  startAndEndOfWeek,
  startAndEndOfYear,
  startOfDay
} from '@/util/date'

export default {
  name: 'FocusTask',
  data() {
    return {
      option: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [],
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      items: ['今天', '昨天', '本周', '本月', '今年', '全部', '自定义时间'],
      item: '今天',
      actions: new Map([
        ['今天', () => this.setStamp(startAndEndOfDay())],
        ['昨天', () => this.setStamp(startAndEndOfDay(dayjs().subtract(1, 'day').valueOf()))],
        ['本周', () => this.setStamp(startAndEndOfWeek())],
        ['本月', () => this.setStamp(startAndEndOfMonth())],
        ['今年', () => this.setStamp(startAndEndOfYear())],
        ['全部', () => this.beginStamp = this.endStamp = undefined],
        ['自定义时间', () => {
          this.beginStamp = startOfDay(dayjs(this.startTime, 'YYYY-MM-DD').valueOf())
          this.endStamp = endOfDay(dayjs(this.endTime, 'YYYY-MM-DD').valueOf())
        }]
      ]),
      startTimeMenu: false,
      endTimeMenu: false,
      startTime: dayjs().format('YYYY-MM-DD'),
      endTime: dayjs().format('YYYY-MM-DD'),
      beginStamp: Date.now(),
      endStamp: Date.now(),
      workTimesSum: 0
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    },
    isCustomDateFilter() {
      return this.item === '自定义时间'
    }
  },
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      this.actions.get(this.item)()
      statistics.getItemsBetween(this.beginStamp, this.endStamp).then(res => {
        this.option.series = [
          {
            name: '任务名 - 时长（分钟）',
            type: 'pie',
            radius: '50%',
            data: res.data.tasksTime,
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0)'
            },
            label: {
              show: true,
              formatter: '{b}: {c}m ({d}%)'
            },
            labelLine: {show: true}
          }
        ]
        this.workTimesSum = res.data.sum
      })
    },
    setStamp({start, end}) {
      this.beginStamp = start
      this.endStamp = end
    },
    selectChangeEvent() {
      this.refreshData()
    },
    startTimePickerHandler() {
      this.startTimeMenu = false
      this.refreshData()
    },
    endTimePickerHandler() {
      this.endTimeMenu = false
      this.refreshData()
    }
  }
}
</script>

<style scoped>

</style>
