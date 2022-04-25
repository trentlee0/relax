<template>
  <div>
    <v-card v-if="tasks.length > 0">
      <template v-for="(task, i) in tasks">
        <v-divider
          v-if="i !== 0"
          :key="`${task.id}-divider`"
        ></v-divider>
        <TodoItem
          :key="task.id"
          :task="task"
          :editing="task.id === editingTaskId"
          @finishUpdate="handleUpdate"
          @changeChecked="checkedClick"
          @contextmenu="handleContextmenu"
        ></TodoItem>
      </template>
    </v-card>

    <v-menu
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    >
      <v-list>
        <v-hover>
          <v-list-item @click="handleMenuStartClick">
            <v-list-item-title>开始专注</v-list-item-title>
          </v-list-item>
        </v-hover>
        <v-hover>
          <v-list-item @click="handleMenuEditClick">
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
        </v-hover>
        <v-hover>
          <v-list-item @click="handleMenuDeleteClick">
            <v-list-item-title class="error--text">删除</v-list-item-title>
          </v-list-item>
        </v-hover>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import TodoItem from '@/components/Todo/TodoItem'

export default {
  name: 'TodoList',
  components: {TodoItem},
  props: ['tasks'],
  data() {
    return {
      showMenu: false,
      x: 0,
      y: 0,
      activeTaskId: null,
      editingTaskId: null
    }
  },
  watch: {
    showMenu(val) {
      if (!val) this.activeTaskId = null
    }
  },
  methods: {
    handleContextmenu(args) {
      const e = args.event
      e.preventDefault()
      this.activeTaskId = args.taskId
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.showMenu = true
    },
    handleUpdate(args) {
      this.$bus.$emit('updateTask', args)
      this.editingTaskId = null
    },
    checkedClick(args) {
      this.$bus.$emit('checkedTask', args)
    },
    handleMenuStartClick() {
      this.$bus.$emit('startTask', {taskId: this.activeTaskId})
    },
    handleMenuEditClick() {
      this.editingTaskId = this.activeTaskId
    },
    handleMenuDeleteClick() {
      this.$bus.$emit('removeTask', {taskId: this.activeTaskId})
    }
  }
}
</script>

<style scoped>
</style>
