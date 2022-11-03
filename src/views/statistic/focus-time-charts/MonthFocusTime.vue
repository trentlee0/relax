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
  name: 'MonthFocusTime',
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
      statistics.getItemsByMonth(d.year(), d.month() + 1).then(res => {
        this.option.xAxis = {
          name: '日期',
          data: res.data.details
        }
        let max = res.data.timeRange.reduce((p, n) => Math.max(p, n))
        this.option.yAxis = {
          type: 'value',
          name: '分钟',
          min: 0,
          max: max <= 10 ? 10 : max
        }
        this.option.series = [{
          name: '日期',
          type: 'bar',
          data: res.data.timeRange
        }]
        this.workTimesSum = res.data.sum
      })
    },
    prev() {
      return this.dateChange(-1)
    },
    next() {
      return this.dateChange(1)
    },
    dateChange(offset) {
      let t = this.pagination.pageDate.add(offset, 'month')
      if (t.isAfter(dayjs(), 'month')) return this.pagination.text

      this.pagination.pageDate = t
      switch (t.diff(dayjs(), 'month')) {
        case 0:
          this.pagination.text = '本月'
          break
        case -1:
          this.pagination.text = '上月'
          break
        default:
          this.pagination.text = t.format('YYYY年MM月')
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
