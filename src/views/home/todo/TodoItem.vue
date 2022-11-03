<template>
  <div>
    <v-list-item
      dense
      @contextmenu="handleContextmenu"
    >
      <v-checkbox
        style="height: 38px"
        :input-value="task.done"
        :color="task.done && 'grey' || 'primary'"
        @change="checkedTask"
        dense
      >
      </v-checkbox>

      <div
        class="item-text-content"
        v-show="!editing"
      >
        <div
          class="ml-4"
          :class="{'text-decoration-line-through grey--text': task.done}"
          v-text="task.title"
        ></div>
        <div
          class="grey--text"
          style="font-size: small;"
          :title="formatDateTitle(task.id)"
          v-text="formatDate(task.id)"
        ></div>
      </div>

      <div
        class="ml-4"
        style="height: 38px; width: 100%"
        v-show="editing"
      >
        <input
          class="text--primary"
          ref="input"
          :value="task.title"
          maxlength="30"
          style="outline: none; height: 38px"
          @blur="updateTaskTitle"
          @keypress.enter="updateTaskTitle"
        />
      </div>
    </v-list-item>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'TodoItem',
  props: ['task', 'editing'],
  watch: {
    editing() {
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    }
  },
  methods: {
    checkedTask(checked) {
      this.$emit('changeChecked', {taskId: this.task.id, done: checked})
    },
    updateTaskTitle(e) {
      this.$emit('finishUpdate', {taskId: this.task.id, taskTitle: e.target.value})
    },
    handleContextmenu(e) {
      this.$emit('contextmenu', {event: e, taskId: this.task.id})
    },
    formatDate(timestamp) {
      return dayjs(timestamp).format('MM-DD')
    },
    formatDateTitle(timestamp) {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
    }
  }
}
</script>

<style lang="sass" scoped>
.item-text-content
  width: 100%
  display: flex
  justify-content: space-between
  align-items: center
</style>
