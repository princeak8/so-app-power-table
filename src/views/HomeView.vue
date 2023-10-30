<template>
    <!-- <TheWelcome /> -->
    <div style="display:flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
      <h1 style="margin:2px; padding: 0;">Power Stations</h1>

      <table border="1" style="width: 40%; font-weight: bold;">
          <thead>
              <th>S/N</th>
              <th>Station</th>
              <th>Power(Mw)</th>
              <th>REACTIVE POWER (Mvar)</th>
              <th>VOLTAGE (Kv)</th>
              <th>STATUS</th>
          </thead>
      </table>
    </div>
</template>


<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { useStationData } from '@/stores/useStationData';

const stationData = useStationData();
</script>