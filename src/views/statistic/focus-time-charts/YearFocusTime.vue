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

export default {
  name: 'YearFocusTime',
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
      statistics.getItemsByYear(d.year()).then(res => {
        this.option.xAxis = {
          name: '月份',
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
          name: '月份',
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
      let t = this.pagination.pageDate.add(offset, 'year')
      if (t.isAfter(dayjs(), 'year')) return this.pagination.text

      this.pagination.pageDate = t
      switch (t.diff(dayjs(), 'year')) {
        case 0:
          this.pagination.text = '今年'
          break
        case -1:
          this.pagination.text = '去年'
          break
        default:
          this.pagination.text = t.format('YYYY年')
      }
      this.refreshData()
      return this.pagination.text
    }
  }
}
</script>

<style scoped>

</style>
