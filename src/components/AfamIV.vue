<template>
  <tr :class="{redBg: powerDrop.status}">
    <td style="padding-left: 5px;">{{ sn }}</td>
    <td class="center">AFAM IV</td>
    <td class="center">{{ vals.mw }}</td>
    <td class="center"> {{ vals.mx}} </td>
    <td class="center"> {{ vals.kv }} </td>
    <td class="center" :class="connectionStatusColor"> {{(isConnected) ? 'Connected' : (isConnectionLost) ? 'Connection Lost' : 'Not Connected'}} </td>
    <td v-if="powerDrop.status">
        <button type="button" @click="acknowledgeDrop()">Acknowledge</button>
    </td>
  </tr>
</template>

<script setup lang="ts">

import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { afamIVStore } from "@/stores/afamIVStore"
import { values } from '@/utilities';

    const stationStore = afamIVStore();
    const { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals } = storeToRefs(stationStore)

    const props = defineProps({
        sn: Number,
        isParent: Boolean
    });

    const emits = defineEmits(['emitTotal']);

    const alarm = ref(false);

    const connectionStatusColor = computed(() => {
      return (isConnected.value) ? 'connected' : (isConnectionLost.value) ? 'connectionLost' : 'notConnected'
    })

    const acknowledgeDrop = () => {
        stationStore.acknowledgePowerDrop();
    }

    watch(vals, (currentVals) => {
      if(currentVals.mw != '' && currentVals.mw != '-') emits('emitTotal', station.value.id, currentVals.mw)
    })
    
    // watch(power, (prevPwr, currPwr) => {
    //   console.log(currPwr);
    //     console.log(`${prevPwr.pwr} - ${currPwr.pwr}`);
    //     if((prevPwr.pwr - currPwr.pwr) >= import.meta.env.VITE_MAX_LOAD_DROP_THRESHOLD) {
    //         alarm.value = true;
    //     }
    // })

</script>

<style scoped>

</style>
