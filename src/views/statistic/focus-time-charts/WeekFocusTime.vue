<template>
  <div>
    <v-chart :theme="chartTheme" autoresize :option="option" style="height: 360px"></v-chart>
    <div class="text--primary font-weight-light text-center">
      {{ pagination.text }} 专注了 {{ workTimesSum }} 分钟
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import statistics from '@/api/statistics'
import * as string from '@/util/string'

export default {
  name: 'WeekFocusTime',
  data() {
    return {
      option: {
        tooltip: {},
        xAxis: {
          data: []
        },
        yAxis: {},
        series: [],
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      pagination: {
        text: '',
        weekOffset: 0
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
      statistics.getItemsByWeek(this.pagination.weekOffset).then(res => {
        this.option.xAxis = {
          name: '星期',
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
          name: '星期',
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
      if (this.pagination.weekOffset === 0 && offset > 0) return this.pagination.text

      this.pagination.weekOffset += offset
      switch (this.pagination.weekOffset) {
        case 0:
          this.pagination.text = '本周'
          break
        case -1:
          this.pagination.text = '上周'
          break
        default:
          const monday = dayjs().startOf('week').add(1, 'd').add(this.pagination.weekOffset, 'week')
          const sunday = monday.add(6, 'd')
          this.pagination.text = string.format('%s-%s', monday.format('MM月DD日'), sunday.format('MM月DD日'))
      }
      this.refreshData()
      return this.pagination.text
    }
  }
}
</script>

<style scoped>

</style>
