import PersianDatePicker from './src/PersianDatePicker.vue'

// Named export
export { PersianDatePicker }

// Default export for Vue plugin
export default {
  install(app) {
    app.component('PersianDatePicker', PersianDatePicker)
  }
}

// Also export as a named export for the plugin
export { default as PersianDatePickerPlugin } from './src/PersianDatePicker.vue'
