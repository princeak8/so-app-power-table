<template>
  <tr :class="{redBg: powerDrop.status}">
    <td style="padding-left: 5px;">{{ sn }}</td>
    <td class="center">ZUNGERU</td>
    <td class="center">{{ vals.mw }}</td>
    <td class="center"> {{ vals.mx}} </td>
    <td class="center"> {{ vals.kv }} </td>
    <td class="center" :class="connectionStatusColor"> {{(isConnected) ? 'Connected' : (isConnectionLost) ? 'Connection Lost' : 'Not Connected'}} </td>
    <td class="center">
      <span v-if="!edit" @click="editDeclaredPower">{{ declaredPower || '-' }}</span>
      <input v-if="edit" type="text" class="form-control" v-model="declaredPower" @blur="saveDeclaredPower" />
    </td>
    <StationPowerDropCols  :powerDropIgnored="powerDropIgnored" :powerDrop="powerDrop" 
                  @emitAcknowledgeDrop="acknowledgeDrop" @emitIgnorePowerDrop="ignorePowerDrop" @emitLiftIgnore="liftIgnore"
    />
  </tr>
</template>

<script setup lang="ts">

import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { zungeruStore } from "@/stores/zungeruStore"
import { inStorage, storage } from '@/localStorage';
import { ignore, lift } from '@/helper';
import StationPowerDropCols from './inc/StationPowerDropCols.vue'

    const stationStore = zungeruStore();
    const storeId = stationStore.$id;
    const { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals } = storeToRefs(stationStore)
    const declaredPower = ref(localStorage.getItem(storeId));
    const edit = ref(false);
    const powerDropIgnored = ref(inStorage('ignore-'+storeId) && storage('ignore-'+storeId) == '1')

    const props = defineProps({
        sn: Number
    });

    const emits = defineEmits(['emitTotal']);

    const connectionStatusColor = computed(() => {
      return (isConnected.value) ? 'connected' : (isConnectionLost.value) ? 'connectionLost' : 'notConnected'
    })

    watch(vals, (currentVals) => {
      if(currentVals.mw != '' && currentVals.mw != '-') emits('emitTotal', station.value.id, currentVals.mw)
    })

    const acknowledgeDrop = () => {
        stationStore.acknowledgePowerDrop();
    }

    const ignorePowerDrop = () => {
      acknowledgeDrop();
      ignore(storeId);
      powerDropIgnored.value = (inStorage('ignore-'+storeId) && storage('ignore-'+storeId) == '1');
    }

    const liftIgnore = () => {
      lift(storeId);
      powerDropIgnored.value = (inStorage('ignore-'+storeId) && storage('ignore-'+storeId) == '1');
    }

    const editDeclaredPower = () => {
      edit.value = true;
    }

    const saveDeclaredPower = () => {
      if(declaredPower.value) localStorage.setItem(storeId, declaredPower.value.toString());
      edit.value = false;
    }
</script>

<style scoped>

</style>
