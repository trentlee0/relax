<template>
  <div>
    <v-chart :theme="chartTheme" autoresize :option="option" style="height: 360px"></v-chart>
    <div class="text--primary font-weight-light text-center">
      累积专注 {{ formatDurationMinutes(workTimesSum) }}
    </div>
  </div>
</template>

<script>
import statistics from '@/api/statistics'
import dayjs from 'dayjs'
import {formatDurationMinutes} from '@/util/date'

export default {
  name: 'DayFocusTime',
  data() {
    return {
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          data: []
        },
        yAxis: {},
        series: [],
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      pagination: {
        text: '',
        pageDate: dayjs()
      },
      workTimesSum: 0
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  methods: {
    refreshData() {
      let d = this.pagination.pageDate
      statistics.getItemsByDay(d.year(), d.month() + 1, d.date()).then(({data}) => {
        this.option.xAxis = {
          name: '时刻',
          data: data.details
        }
        this.option.yAxis = {
          type: 'value',
          min: 0,
          max: 60,
          name: '分钟'
        }
        this.option.series = [{
          name: '时刻',
          type: 'bar',
          data: data.timeRange
        }]
        this.workTimesSum = data.sum
      })
    },
    prev() {
      return this.dateChange(-1)
    },
    next() {
      return this.dateChange(1)
    },
    dateChange(offset) {
      let t = this.pagination.pageDate.add(offset, 'd')
      if (t.isAfter(dayjs(), 'd')) return this.pagination.text

      this.pagination.pageDate = t
      switch (t.diff(dayjs(), 'd')) {
        case 0:
          this.pagination.text = '今天'
          break
        case -1:
          this.pagination.text = '昨天'
          break
        default:
          this.pagination.text = t.format('MM月DD日')
      }
      this.refreshData()
      return this.pagination.text
    },
    formatDurationMinutes(minutes) {
      return formatDurationMinutes(minutes)
    }
  }
}
</script>

<style scoped>

</style>
