<template>
  <div>
    <v-card v-if="tasks.length > 0">
      <div
        :draggable="!task.done"
        @dragstart="dragEnterEvent($event, i)"
        @drop="dropEvent($event, i)"
        @dragover.prevent
        v-for="(task, i) in tasks"
      >
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
      </div>
    </v-card>

    <v-menu
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    >
      <v-list dense>
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

    <Dialog
      title="将要删除任务？"
      :show.sync="removeTaskDialog"
      @confirm="handleDelete"
    >
    </Dialog>
  </div>
</template>

<script>
import TodoItem from '@/views/home/todo/TodoItem'
import Dialog from '@/components/Dialog'

export default {
  name: 'TodoList',
  components: {Dialog, TodoItem},
  props: ['tasks'],
  data() {
    return {
      showMenu: false,
      x: 0,
      y: 0,
      activeTaskId: null,
      editingTaskId: null,
      removeTaskDialog: false,
      removeTaskId: null
    }
  },
  watch: {
    showMenu(val) {
      if (!val) this.activeTaskId = null
    }
  },
  methods: {
    dragEnterEvent(event, index) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('fromIndex', index)
    },
    dropEvent(event, toIndex) {
      event.preventDefault()
      const fromIndex = event.dataTransfer.getData('fromIndex')
      this.$bus.$emit('dropTodoItem', {fromIndex, toIndex})
    },
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
      this.removeTaskId = this.activeTaskId
      this.removeTaskDialog = true
    },
    handleDelete() {
      this.$bus.$emit('removeTask', {taskId: this.removeTaskId})
      this.removeTaskDialog = false
    }
  }
}
</script>

<style scoped>
</style>
