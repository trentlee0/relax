<template>
  <div>
    <v-list-item
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
        class="ml-4"
        :class="{'text-decoration-line-through grey--text': task.done}"
        v-text="task.title"
        v-show="!editing"
      ></div>

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
    }
  }
}
</script>

<style scoped>

</style>
