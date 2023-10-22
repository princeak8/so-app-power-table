<template>
  <tr :class="{redBg: powerDrop.status}">
    <td style="padding-left: 5px;">{{ sn }}</td>
    <td class="center">AZURA-EDO IPP (GAS)</td>
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
import { azuraStore } from "@/stores/azuraStore"

    const stationStore = azuraStore();
    const { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals } = storeToRefs(stationStore)

    const props = defineProps({
        sn: Number,
        isParent: Boolean
    });

    const emits = defineEmits(['emitTotal']);

    const connectionStatusColor = computed(() => {
      return (isConnected.value) ? 'connected' : (isConnectionLost.value) ? 'connectionLost' : 'notConnected'
    })

    // const power = computed(() => {
    //     let pwrObj = getPower(station.value.sections, true);
    //     if(pwrObj.status) emits('emitTotal', station.value.id, pwrObj.pwr)
    //     return pwrObj;
    // });
    watch(vals, (currentVals) => {
      if(currentVals.mw != '' && currentVals.mw != '-') emits('emitTotal', station.value.id, currentVals.mw)
    })

    const acknowledgeDrop = () => {
        stationStore.acknowledgePowerDrop();
    }
</script>

<style scoped>

</style>
