<template>
  <div>
    <v-dialog
      :value="show"
      max-width="340"
      @click:outside="no"
      @keydown.esc.stop="no"
      :persistent="!cancelable"
    >
      <v-card>
        <v-card-title class="text-h6">
          {{ title }}
        </v-card-title>
        <slot></slot>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="no"
            v-if="cancelable"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="yes"
          >
            {{ confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    },
    cancelable: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '否'
    },
    confirmText: {
      type: String,
      default: '是'
    }
  },
  methods: {
    yes() {
      this.$emit('confirm')
    },
    no() {
      this.$emit('update:show', false)
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>

</style>
