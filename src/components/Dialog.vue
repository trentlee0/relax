<template>
  <div>
    <v-dialog
      :value="show"
      max-width="340"
      @click:outside="no"
      @keydown="no"
    >
      <v-card>
        <v-card-title class="text-h6">
          {{ title }}
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="no"
          >
            否
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="yes"
          >
            是
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
    }
  },
  methods: {
    yes() {
      this.$emit('confirm')
    },
    no() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>

</style>
