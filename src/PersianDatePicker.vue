<template>
  <div class="persian-date-picker">
    <div class="picker-container">
      <div
        class="picker-column"
        v-for="type in columnsOrder"
        :key="type"
      >
        <div class="picker-mask"></div>
        <div class="picker-indicator"></div>
        <div
          class="picker-content"
          @touchstart="onTouchStart($event, type)"
          @touchmove="onTouchMove($event, type)"
          @touchend="onTouchEnd(type)"
          @wheel="onWheel($event, type)"
        >
          <template v-if="type === 'year'">
            <div
              v-for="(year, index) in displayYears"
              :key="`${year}-${index}`"
              class="picker-item"
              :class="{ 'picker-item-selected': selectedYear === year }"
              :style="getItemStyle(index, 'year')"
            >
              {{ year }}
            </div>
          </template>

          <template v-else-if="type === 'month'">
            <div
              v-for="(month, index) in displayMonths"
              :key="`${month.value}-${index}`"
              class="picker-item"
              :class="{ 'picker-item-selected': selectedMonth === month.value }"
              :style="getItemStyle(index, 'month')"
            >
              {{ month.label }}
            </div>
          </template>

          <template v-else>
            <div
              v-for="(day, index) in displayDays"
              :key="`${day}-${index}`"
              class="picker-item"
              :class="{ 'picker-item-selected': selectedDay === day }"
              :style="getItemStyle(index, 'day')"
            >
              {{ day }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="submit-button" @click="onConfirm">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import moment from 'moment-jalaali'

export default {
  name: 'PersianDatePicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    minAge: {
      type: Number,
      default: 16,
      validator: (value) => value >= 0
    },
    maxAge: {
      type: Number,
      default: 70,
      validator: (value) => value >= 0 && value > 16
    },
    initialDate: {
      type: String,
      default: ''
    },
    buttonText: { type: String, default: 'تایید' },
    direction: {
      type: String,
      default: 'ltr',
      validator: (value) => ['rtl', 'ltr'].includes(value)
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const VISIBLE_ITEMS = 7 // Number of visible items
    const ITEM_HEIGHT = 20 // Height of each item in pixels
    const MIDDLE_INDEX = Math.floor(VISIBLE_ITEMS / 2)

    // Set initial values based on modelValue, initialDate prop, or defaults
    let initialYear = 1365
    let initialMonth = 1
    let initialDay = 1

    // Priority: modelValue > initialDate > defaults
    const dateToUse = props.modelValue || props.initialDate

    if (dateToUse) {
      const [year, month, day] = dateToUse.split('/')
      const currentYear = parseInt(moment().format('jYYYY'))
      const minYear = currentYear - props.maxAge
      const maxYear = currentYear - props.minAge

      if (year > maxYear || year > currentYear) {
        initialYear = maxYear
      } else if (year < minYear){
        initialYear = minYear
      } else {
        initialYear =  parseInt(year)
      }

      initialMonth = parseInt(month)
      initialDay = parseInt(day)
    }

    const selectedYear = ref(initialYear)
    const selectedMonth = ref(initialMonth)
    const selectedDay = ref(initialDay)
    const scrollOffsets = ref({ year: 0, month: 0, day: 0 })

    // Watch for modelValue changes to update the selected date
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        const [year, month, day] = newValue.split('/')
        const currentYear = parseInt(moment().format('jYYYY'))
        const minYear = currentYear - props.maxAge
        const maxYear = currentYear - props.minAge

        let validYear = parseInt(year)
        if (validYear > maxYear || validYear > currentYear) {
          validYear = maxYear
        } else if (validYear < minYear) {
          validYear = minYear
        }

        selectedYear.value = validYear
        selectedMonth.value = parseInt(month)
        selectedDay.value = parseInt(day)
      }
    })

    // Base data
    const years = computed(() => {
      const currentYear = parseInt(moment().format('jYYYY'))
      const minYear = currentYear - props.maxAge
      const maxYear = currentYear - props.minAge
      const years = []
      for (let i = minYear; i <= maxYear; i++) {
        years.push(i)
      }
      return years
    })

    const months = computed(() => [
      { value: 1, label: 'فروردین' },
      { value: 2, label: 'اردیبهشت' },
      { value: 3, label: 'خرداد' },
      { value: 4, label: 'تیر' },
      { value: 5, label: 'مرداد' },
      { value: 6, label: 'شهریور' },
      { value: 7, label: 'مهر' },
      { value: 8, label: 'آبان' },
      { value: 9, label: 'آذر' },
      { value: 10, label: 'دی' },
      { value: 11, label: 'بهمن' },
      { value: 12, label: 'اسفند' }
    ])

    const days = computed(() => {
      const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value)
      return Array.from({ length: daysInMonth }, (_, i) => i + 1)
    })

    // Display data with circular effect
    const displayYears = computed(() => {
      return createCircularArray(years.value, selectedYear.value)
    })

    const displayMonths = computed(() => {
      return createCircularArray(months.value, months.value.find(m => m.value === selectedMonth.value))
    })

    const displayDays = computed(() => {
      return createCircularArray(days.value, selectedDay.value)
    })

    const columnsOrder = computed(() => {
      return props.direction === 'rtl'
        ? ['year', 'month', 'day']
        : ['day', 'month', 'year']
    })

    function createCircularArray(sourceArray, currentItem) {
      const result = []
      const arrayLength = sourceArray.length
      const currentIndex = sourceArray.indexOf(currentItem)

      for (let i = -MIDDLE_INDEX; i <= MIDDLE_INDEX; i++) {
        let index = currentIndex + i

        // Handle circular wrapping
        while (index < 0) index += arrayLength
        while (index >= arrayLength) index -= arrayLength

        result.push(sourceArray[index])
      }

      return result
    }

    function getItemStyle(index, type) {
      const offset = scrollOffsets.value[type]
      const translateY = (index - MIDDLE_INDEX) * ITEM_HEIGHT + offset
      const scale = 1 - Math.abs(index - MIDDLE_INDEX) * 0.1
      const opacity = 1 - Math.abs(index - MIDDLE_INDEX) * 0.2

      return {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity
      }
    }

    function getDaysInMonth(year, month) {
      if (month <= 6) return 31
      if (month <= 11) return 30
      return isLeapYear(year) ? 30 : 29
    }

    function isLeapYear(year) {
      return ((((year + 38) * 31) % 128) <= 30)
    }

    let touchStartTime = 0
    let touchStartY = 0

    let startY = 0
    let currentY = 0
    let currentType = null
    let lastScrollTime = 0
    const scrollThreshold = 50 // ms between scroll events

    function onWheel(event, type) {
      const now = Date.now()
      if (now - lastScrollTime < scrollThreshold) return
      lastScrollTime = now

      const delta = event.deltaY
      const direction = delta > 0 ? 1 : -1
      updateSelection(type, direction)
      event.preventDefault()
    }

    function onTouchStart(event, type) {
      touchStartY = event.touches[0].clientY
      touchStartTime = Date.now()

      startY = touchStartY
      currentY = scrollOffsets.value[type]
      currentType = type
      event.preventDefault()
    }


    function onTouchMove(event, type) {
      if (currentType !== type) return
      const deltaY = event.touches[0].clientY - startY
      scrollOffsets.value[type] = currentY + deltaY
      event.preventDefault()
    }

    function computeScrollSteps(velocity) {
      const minVelocity = 0.3    // فقط سرعت‌های خیلی محسوس اعمال می‌شن
      const velocityFactor = 3   // کنترل حساسیت کلی
      const maxSteps = 5          // محدود کردن تعداد اسکرول‌ها

      // اگر سرعت خیلی کم بود، فقط یک قدم بردار
      if (Math.abs(velocity) < minVelocity) {
        return velocity > 0 ? 1 : -1
      }

      const scaled = velocity * velocityFactor
      const steps = Math.round(scaled)

      return Math.max(-maxSteps, Math.min(maxSteps, steps))
    }

    function animateInertiaScroll(type, steps) {
      let currentStep = 0
      const totalSteps = Math.abs(steps)
      const direction = Math.sign(steps)

      function animate() {
        if (currentStep < totalSteps) {
          updateSelection(type, direction)
          currentStep++
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }

    function onTouchEnd(type) {
      if (currentType !== type) return

      const endTime = Date.now()
      const endY = scrollOffsets.value[type]
      const deltaY = endY - currentY
      const deltaTime = endTime - touchStartTime

      const velocity = deltaY / deltaTime // px/ms

      const steps = computeScrollSteps(velocity)
      animateInertiaScroll(type, steps)

      scrollOffsets.value[type] = 0
      currentType = null
      startY = 0
      currentY = 0
    }


    function updateSelection(type, direction) {
      let currentArray, currentValue, setValue

      switch (type) {
        case 'year':
          currentArray = years.value
          currentValue = selectedYear.value
          setValue = (val) => selectedYear.value = val
          break
        case 'month':
          currentArray = months.value
          currentValue = months.value.find(m => m.value === selectedMonth.value)
          setValue = (val) => selectedMonth.value = val.value
          break
        case 'day':
          currentArray = days.value
          currentValue = selectedDay.value
          setValue = (val) => selectedDay.value = val
          break
      }

      const currentIndex = currentArray.indexOf(currentValue)
      let newIndex = currentIndex - direction

      if (newIndex < 0) newIndex = currentArray.length - 1
      if (newIndex >= currentArray.length) newIndex = 0

      setValue(currentArray[newIndex])
    }

    function onConfirm() {
      const formattedDate = `${selectedYear.value}/${String(selectedMonth.value).padStart(2, '0')}/${String(selectedDay.value).padStart(2, '0')}`
      emit('update:modelValue', formattedDate)
    }

    return {
      selectedYear,
      selectedMonth,
      selectedDay,
      displayYears,
      displayMonths,
      displayDays,
      columnsOrder,
      scrollOffsets,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onWheel,
      getItemStyle,
      onConfirm
    }
  }
}
</script>

<style scoped>
.persian-date-picker {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.picker-container {
  display: flex;
  justify-content: space-between;
  height: 224px;
  position: relative;
  overflow: hidden;
}

.picker-column {
  flex: 1;
  position: relative;
  text-align: center;
  height: 100%;
  overflow: hidden;
}

.picker-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.6) 45%,
    rgba(255, 255, 255, 0.6) 55%,
    rgba(255, 255, 255, 0.95) 100%
  );
  z-index: 3;
  pointer-events: none;
}

.picker-indicator {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  background: rgba(61, 114, 254, 0.09);
  border-top: 1px solid rgba(61, 114, 254, 0.2);
  border-bottom: 1px solid rgba(61, 114, 254, 0.2);
  box-shadow: 0 0 10px rgba(61, 114, 254, 0.05);
  z-index: 2;
  pointer-events: none;
}

.picker-content {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  transition: transform 0.2s ease-out;
}

.picker-item {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  font-weight: 600;
  color: #3e3e3e;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.picker-item:not(.picker-item-selected):hover {
  color: #3d72fe;
  transform: scale(1.05);
}

.picker-item-selected {
  color: #003dcc;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 1px rgba(61, 114, 254, 0.2);
}

.actions {
  padding-top: 20px;
}

.q-btn {
  width: 100%;
  border: 1px solid #3d72fe;
  color: #3d72fe;
  font-size: 14px;
  border-radius: 4px;
  height: 44px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.q-btn:hover {
  background: #3d72fe;
  color: white !important;
}

.q-btn:active {
  transform: scale(0.98);
}

.submit-button {
  width: 100%;
  border: 1px solid #3d72fe;
  color: #3d72fe;
  font-size: 14px;
  border-radius: 4px;
  height: 44px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: transparent;
}

.submit-button:hover {
  background: #3d72fe;
  color: white !important;
}

.submit-button:active {
  transform: scale(0.98);
}
</style>
