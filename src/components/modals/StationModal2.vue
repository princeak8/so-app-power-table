<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="modal-overlay fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 h-auto"
      
      @click="close"
    >
      <div
        class="modal-content bg-gray-100 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-gray-300"
        @click.stop
      >
        <!-- Header -->
        <div class="modal-header bg-gray-800 px-6 py-4 flex justify-between items-center text-white">
          <div class="flex items-center space-x-4">
            <div class="w-3 h-3 rounded-full" :class="statusIndicatorClass"></div>
            <div>
              <h2 class="text-xl font-bold">
                {{ station?.id }} - Power Station
              </h2>
              <p class="text-sm text-gray-300 mt-1">
                Last updated: {{ new Date().toLocaleTimeString() }}
              </p>
            </div>
          </div>
          <button 
            @click="close" 
            class="text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
            aria-label="Close"
          >
            <!-- <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg> -->
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body overflow-y-auto bg-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-6 px-10">
          <!-- Overview Panel -->
          <div class="lg:col-span-1 bg-white rounded-lg shadow border border-gray-250 px-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <!-- <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg> -->
              Station Overview
            </h3>
            
            <div class="space-y-4 px-6">
              <div class="flex justify-between items-center py-4 border-b border-gray-100">
                <span class="text-gray-600">Status</span>
                <span class="font-medium" :class="statusTextClass">{{ stationStatus }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-blue-600">Total Units</span>
                <span class="font-medium text-gray-800">{{ station?.sections?.length || 0 }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Active Units</span>
                <span class="font-medium text-green-600">{{ activeUnits }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Total Generation</span>
                <span class="font-medium text-blue-600">{{ totalPower }} MW</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Reactive Power</span>
                <span class="font-medium text-purple-600">{{ totalReactivePower }} MVar</span>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Generation Summary</h4>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity</span>
                  <span>{{ capacityPercentage }}% Utilization</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full" 
                    :class="capacityBarClass"
                    :style="`width: ${capacityPercentage}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Units Grid -->
          <div class="lg:col-span-2 bg-white rounded-lg p-5 shadow border border-gray-250 overflow-hidden px-6">
            <div class="flex justify-between items-center mb-5 px-10">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generation Units
              </h3>
              <div class="text-sm text-gray-500">
                Showing {{ station?.sections?.length || 0 }} units
              </div>
            </div>
            
            <div v-if="station?.sections && station.sections.length > 0" class="flex flex-row flex-wrap gap-4 max-h-96 overflow-y-auto pr-2">
              <div
                v-for="(unit, index) in station.sections"
                :key="index"
                class="unit-card border rounded-lg p-4 transition-all duration-200 hover:shadow-sm w-[30%]"
                :class="getUnitCardClass(unit)"
              >
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-bold text-md" :class="getUnitTextClass(unit)">
                    Unit {{ unit.id }}
                  </h4>
                  <div class="flex items-center space-x-2">
                    <div 
                      class="w-2.5 h-2.5 rounded-full" 
                      :class="getUnitStatusColor(unit)"
                    ></div>
                    <span class="text-xs font-medium" :class="getUnitTextClass(unit)">
                      {{ getUnitStatus(unit) }}
                    </span>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-gray-50 p-2 rounded border border-gray-100">
                    <div class="text-xs font-medium text-gray-500 mb-1">Power Output</div>
                    <div class="text-md font-bold" :class="getUnitTextClass(unit)">
                      {{ formatValue(unit.data.mw) }} <span class="text-xs font-normal">MW</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded border border-gray-100">
                    <div class="text-xs font-medium text-gray-500 mb-1">Reactive Power</div>
                    <div class="text-md font-bold" :class="getUnitTextClass(unit)">
                      {{ formatValue(unit.data.mvar) }} <span class="text-xs font-normal">MVar</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded border border-gray-100">
                    <div class="text-xs font-medium text-gray-500 mb-1">Voltage</div>
                    <div class="text-md font-bold text-gray-800">
                      {{ formatValue(unit.data.v) }} <span class="text-xs font-normal">kV</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-2 rounded border border-gray-100">
                    <div class="text-xs font-medium text-gray-500 mb-1">Current</div>
                    <div class="text-md font-bold text-gray-800">
                      {{ formatValue(unit.data.a) }} <span class="text-xs font-normal">A</span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-3 pt-2 border-t border-gray-100">
                  <div class="text-xs text-gray-500">
                    <span class="font-medium">Capacity:</span> 
                    <span>{{ calculateCapacity(unit.data.mw) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      class="h-1.5 rounded-full" 
                      :class="getCapacityBarColor(unit)"
                      :style="`width: ${calculateCapacity(unit.data.mw)}%`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center text-gray-500 py-8">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.464-.881-6.08-2.33C5.92 12.67 6 12.34 6 12s-.08-.67-.08-.67C7.536 10.881 9.66 10 12 10s4.464.881 6.08 2.33c0 0-.08.34-.08.67s.08.67.08.67z" />
              </svg>
              <h3 class="text-md font-medium text-gray-700 mb-1">No Unit Data Available</h3>
              <p class="text-xs text-gray-400">Station data is currently unavailable or still loading.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-200">
          <button 
            @click="close" 
            class="px-5 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
  if (val === null || val === undefined || val === '' || val === '-') return 0
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

const totalReactivePower = computed(() => {
  if (!props.station?.sections) return 0;
  return props.station.sections
    .filter(unit => unit.data.mvar && !isNaN(toNumber(unit.data.mvar)))
    .reduce((sum, unit) => sum + toNumber(unit.data.mvar), 0)
    .toFixed(1);
});

const stationStatus = computed(() => {
  const total = props.station?.sections?.length || 0;
  const active = activeUnits.value;
  if (active === 0) return 'Offline';
  if (active === total) return 'Full Operation';
  return 'Partial Operation';
});

const statusIndicatorClass = computed(() => {
  const status = stationStatus.value;
  if (status === 'Offline') return 'bg-gray-400';
  if (status === 'Partial Operation') return 'bg-yellow-400';
  return 'bg-green-400 animate-pulse';
});

const statusTextClass = computed(() => {
  const status = stationStatus.value;
  if (status === 'Offline') return 'text-gray-600';
  if (status === 'Partial Operation') return 'text-yellow-600';
  return 'text-green-600';
});

// Calculate capacity percentage (assuming 100MW max per unit for demonstration)
const capacityPercentage = computed(() => {
  if (!props.station?.sections) return 0;
  const maxCapacity = props.station.sections.length * 100;
  const currentOutput = toNumber(totalPower.value);
  return Math.min(100, Math.round((currentOutput / maxCapacity) * 100));
});

const capacityBarClass = computed(() => {
  const percentage = capacityPercentage.value;
  if (percentage < 40) return 'bg-green-500';
  if (percentage < 70) return 'bg-yellow-500';
  return 'bg-red-500';
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
  if (power > 0 && power < 50) return 'border-yellow-200 bg-yellow-50';
  if (power >= 50 && power < 80) return 'border-green-200 bg-green-50';
  return 'border-blue-200 bg-blue-50';
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
  return 'bg-blue-400';
};

const calculateCapacity = (value: any): number => {
  const power = toNumber(value);
  // Assuming 100MW is maximum capacity per unit for demonstration
  return Math.min(100, Math.round((power / 100) * 100));
};

const getCapacityBarColor = (unit: any): string => {
  const capacity = calculateCapacity(unit.data.mw);
  if (capacity === 0) return 'bg-gray-300';
  if (capacity < 40) return 'bg-green-500';
  if (capacity < 70) return 'bg-yellow-500';
  return 'bg-red-500';
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
  color: black;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.95) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.unit-card {
  transition: all 0.2s ease;
}

.unit-card:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar for units grid */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>