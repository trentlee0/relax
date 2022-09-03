<template>
  <div>
    <ChipTab
      :active="activeChip"
      :chip-tabs="chipTabs"
      @change="chipChangeEvent"
    >
      <template #right>
        <SimplePagination
          @prevClick="prevClickEvent"
          @nextClick="nextClickEvent"
          :text="paginationText"
        ></SimplePagination>
      </template>
    </ChipTab>
    <v-card
      flat
      class="ma-auto"
      max-width="1000"
    >
      <DayFocusTime v-if="activeChip === 0" ref="day"></DayFocusTime>
      <WeekFocusTime v-else-if="activeChip === 1" ref="week"></WeekFocusTime>
      <MonthFocusTime v-else-if="activeChip === 2" ref="month"></MonthFocusTime>
      <YearFocusTime v-else-if="activeChip === 3" ref="year"></YearFocusTime>
    </v-card>
  </div>
</template>

<script>
import ChipTab from '@/components/ChipTab'
import SimplePagination from '@/components/SimplePagination'
import DayFocusTime from '@/views/statistic/focus-time-charts/DayFocusTime'
import WeekFocusTime from '@/views/statistic/focus-time-charts/WeekFocusTime'
import MonthFocusTime from '@/views/statistic/focus-time-charts/MonthFocusTime'
import YearFocusTime from '@/views/statistic/focus-time-charts/YearFocusTime'
import dayjs from 'dayjs'

export default {
  name: 'FocusTime',
  components: {YearFocusTime, MonthFocusTime, WeekFocusTime, DayFocusTime, SimplePagination, ChipTab},
  data() {
    return {
      chipTabs: ['天', '周', '月', '年'],
      activeChip: 0,
      paginationText: ''
    }
  },
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      console.log('focus-time refresh')
      this.$nextTick(() => {
        switch (this.activeChip) {
          case 0:
            this.$refs.day.pagination = {text: '', pageDate: dayjs()}
            this.paginationText = this.$refs.day.dateChange(0)
            break
          case 1:
            this.$refs.week.pagination = {text: '', weekOffset: 0}
            this.paginationText = this.$refs.week.dateChange(0)
            break
          case 2:
            this.$refs.month.pagination = {text: '', pageDate: dayjs()}
            this.paginationText = this.$refs.month.dateChange(0)
            break
          case 3:
            this.$refs.year.pagination = {text: '', pageDate: dayjs()}
            this.paginationText = this.$refs.year.dateChange(0)
            break
        }
      })
    },
    chipChangeEvent(activeItem) {
      this.activeChip = activeItem.index
      this.refreshData()
    },
    prevClickEvent() {
      switch (this.activeChip) {
        case 0:
          this.paginationText = this.$refs.day.prev()
          break
        case 1:
          this.paginationText = this.$refs.week.prev()
          break
        case 2:
          this.paginationText = this.$refs.month.prev()
          break
        case 3:
          this.paginationText = this.$refs.year.prev()
          break
      }
    },
    nextClickEvent() {
      switch (this.activeChip) {
        case 0:
          this.paginationText = this.$refs.day.next()
          break
        case 1:
          this.paginationText = this.$refs.week.next()
          break
        case 2:
          this.paginationText = this.$refs.month.next()
          break
        case 3:
          this.paginationText = this.$refs.year.next()
          break
      }
    }
  }
}
</script>

<style scoped>

</style>
