<template>
  <tr :class="{redBg: powerDrop.status}">
    <td style="padding-left: 5px;">{{ sn }}</td>
    <td class="center">DELTA 2 (Gas)</td>
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
import { delta2Store } from "@/stores/delta2Store"
import { inStorage, storage } from '@/localStorage';
import { ignore, lift } from '@/helper';
import StationPowerDropCols from './inc/StationPowerDropCols.vue';
import { stationId, settings } from '@/enums';

    const stationStore = delta2Store();
    const storeId = stationStore.$id;
    const { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals, targetPower, referenceLoad } = storeToRefs(stationStore)
    const declaredPower = ref(localStorage.getItem(storeId));
    const edit = ref(false);
    const powerDropIgnored = ref(inStorage('ignore-'+storeId) && storage('ignore-'+storeId) == '1');
    const currLoad = ref();
    const prevLoad = ref();

    const props = defineProps({
        sn: Number,
        isParent: Boolean
    });

    const emits = defineEmits(['emitTotal', 'resetTotal', 'startAlarm', 'stopAlarm', 'saveLoadDrop', 'acknowledge']);

    watch(() => powerDrop.value, (powerDropped) => {
      if(powerDropped.status) {
          emits('startAlarm');
          const data = {
              powerStationId: station.value.id, 
              load: parseFloat(vals.value.mw), 
              previousLoad: (prevLoad.value==null) ? 0 : parseFloat(prevLoad.value),
              referenceLoad: referenceLoad.value,
              // percentage: powerDrop.value.percentage, 
              timeOfDrop: new Date().toISOString(),
              calType: localStorage.getItem(settings.LoadDropOption)
            }
            emits('saveLoadDrop', data);
        }
    })

    const connectionStatusColor = computed(() => {
      return (isConnected.value) ? 'connected' : (isConnectionLost.value) ? 'connectionLost' : 'notConnected'
    })

    watch(() => isConnected.value, (connected) => {
      if(!connected) emits('resetTotal', station.value.id);
    })

    watch(vals, (currentVals) => {
      if(currentVals.mw != '' && currentVals.mw != '-') {
            prevLoad.value = currLoad.value;
            currLoad.value = currentVals.mw;
            emits('emitTotal', station.value.id, currentVals.mw);
      }
      // if(powerDrop.value.status) emits('startAlarm');
    })

    const acknowledgeDrop = () => {
        stationStore.acknowledgePowerDrop();
        emits('stopAlarm');
        const data = {
            identifier: station.value.id, 
            acknowledgedAt: new Date().toISOString()
        }
        emits('acknowledge', data);
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
      if(!declaredPower.value) declaredPower.value = '';
      localStorage.setItem(storeId, declaredPower.value.toString());
      edit.value = false;
    }
</script>

<style scoped>

</style>
