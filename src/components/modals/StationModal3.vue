<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="modal-overlay fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center p-4 z-50"
      style="
        position: fixed !important;
        top: 10rem !important;
        left: 10% !important;
        width: 80% !important;
        height: auto !important;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999 !important;
      "
      @click="close"
    >
      <div
        class="modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200"
        @click.stop
      >
        <!-- Header -->
        <div class="modal-header bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center text-black">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 class="text-4xl font-bold text-black" style="font-size: large;">
              {{ station?.id }} - Power Station Details
            </h2>
          </div>
          <button 
            @click="close" 
            class="text-black hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

       

        <!-- Footer -->
        <div class="modal-footer bg-white px-6 py-4 flex justify-end border-t border-gray-200">
          <button 
            @click="close" 
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { stationType } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  station: stationType
}>()

const emit = defineEmits(['close'])

const close = () => emit('close')

const toNumber = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined || val === '' || val === '-') return NaN
  return typeof val === 'number' ? val : parseFloat(val)
}

const activeUnits = computed(() => {
  if (!props.station?.sections) return 0;
  return props.station.sections.filter(unit => 
    unit.data.mw && toNumber(unit.data.mw) > 0
  ).length;
});

const totalPower = computed(() => {
  if (!props.station?.sections) return 0;
  return props.station.sections
    .filter(unit => unit.data.mw && !isNaN(toNumber(unit.data.mw)))
    .reduce((sum, unit) => sum + toNumber(unit.data.mw), 0)
    .toFixed(1);
});

const stationStatus = computed(() => {
  const total = props.station?.sections?.length || 0;
  const active = activeUnits.value;
  if (active === 0) return 'Offline';
  if (active === total) return 'Full Operation';
  return 'Partial Operation';
});

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '' || value === '-') {
    return '-';
  }
  const num = parseFloat(value);
  return isNaN(num) ? '-' : num.toFixed(1);
};

const getUnitStatus = (unit: any): string => {
  const power = parseFloat(unit.data.mw);
  if (isNaN(power) || power <= 0) return 'Offline';
  if (power > 0 && power < 50) return 'Low Load';
  if (power >= 50 && power < 80) return 'Normal';
  return 'High Load';
};

const getUnitCardClass = (unit: any): string => {
  const power = parseFloat(unit.data.mw);
  if (isNaN(power) || power <= 0) return 'border-gray-300 bg-gray-50';
  if (power > 0 && power < 50) return 'border-yellow-300 bg-yellow-50';
  if (power >= 50 && power < 80) return 'border-green-300 bg-green-50';
  return 'border-blue-300 bg-blue-50';
};

const getUnitTextClass = (unit: any): string => {
  const power = parseFloat(unit.data.mw);
  if (isNaN(power) || power <= 0) return 'text-gray-600';
  if (power > 0 && power < 50) return 'text-yellow-700';
  if (power >= 50 && power < 80) return 'text-green-700';
  return 'text-blue-700';
};

const getUnitStatusColor = (unit: any): string => {
  const power = parseFloat(unit.data.mw);
  if (isNaN(power) || power <= 0) return 'bg-gray-400';
  if (power > 0 && power < 50) return 'bg-yellow-400';
  if (power >= 50 && power < 80) return 'bg-green-400';
  return 'bg-blue-400 animate-pulse';
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
  color: black !important;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>