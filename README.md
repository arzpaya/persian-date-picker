# Vue Persian Date Picker

A beautiful and modern Persian (Jalali) date picker component for Vue 3 with touch support and smooth animations.

**Created by Ayeen Sepehri**

## Features

- 🗓️ **Persian Calendar Support**: Full Jalali/Shamsi calendar system
- 📱 **Touch & Mouse Support**: Works on both mobile and desktop
- 🎨 **Modern UI**: Beautiful design with smooth animations
- ⚡ **Vue 3**: Built with Composition API
- 🎯 **Accessible**: Keyboard and screen reader friendly
- 📦 **Lightweight**: Minimal dependencies
- 🎭 **Customizable**: Easy to style and configure

## Installation

```bash
npm install arzpaya-persian-date-picker
```

## Usage

```vue
<template>
  <PersianDatePicker
    v-model="selectedDate"
    :min-age="18"
    :max-age="65"
    button-text="انتخاب تاریخ"
  />
</template>

<script>
import { PersianDatePicker } from 'arzpaya-persian-date-picker'

export default {
  components: { PersianDatePicker },
  data() {
    return {
      selectedDate: ''
    }
  }
}
</script>

<!-- نیازی به ایمپورت دستی CSS نیست. CSS به صورت خودکار تزریق می‌شود. -->
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | String | `''` | The selected date in YYYY/MM/DD format |
| `minAge` | Number | `16` | Minimum age limit |
| `maxAge` | Number | `70` | Maximum age limit |
| `initialDate` | String | `''` | Initial date to display |
| `buttonText` | String | `'تایید'` | Text for the confirm button |

## License

MIT
