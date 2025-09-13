<template>
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div
          class="modal-content bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999 !important;
      "
        >
          <!-- Header -->
          <div class="modal-header bg-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold">
              {{ station?.id }} - Unit Details
            </h2>
            <button @click="close" class="text-gray-500 hover:text-gray-700">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
  
          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto">
            <div
              v-if="station?.sections && station.sections.length > 0"
              class="units-grid grid gap-4"
            >
              <div
                v-for="(unit, index) in station.sections"
                :key="index"
                class="unit-card p-4 border rounded-lg"
              >
                <h3 class="font-semibold mb-3">Unit {{ unit.id }}</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div><span class="font-medium">Power:</span> {{ unit.data.mw ?? '-' }} MW</div>
                  <div><span class="font-medium">MVar:</span> {{ unit.data.mvar ?? '-' }} MVar</div>
                  <div><span class="font-medium">Voltage:</span> {{ unit.data.v ?? '-' }} kV</div>
                  <div><span class="font-medium">Current:</span> {{ unit.data.a ?? '-' }} A</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              No unit data available
            </div>
          </div>
  
          <!-- Footer -->
          <div class="modal-footer bg-gray-100 px-6 py-3 flex justify-end">
            <button @click="close" class="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  import type { stationType } from '@/types';
  
  defineProps<{
    isOpen: boolean;
    station: stationType
  }>()
  
  const emit = defineEmits(['close'])
  
  const close = () => emit('close')
  </script>
  