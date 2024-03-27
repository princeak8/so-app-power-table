<template>
  <tr :class="{redBg: powerDrop.status}">
    <td style="padding-left: 5px;">{{ sn }}</td>
    <td class="center">AFAM IV</td>
    <td class="center">{{ vals.mw }}</td>
    <td class="center"> {{ vals.mx}} </td>
    <td class="center"> {{ vals.kv }} </td>
    <td class="center" :class="connectionStatusColor"> {{(isConnected) ? 'Connected' : (isConnectionLost) ? 'Connection Lost' : 'Not Connected'}} </td>
    <td class="center">
      <span v-if="!edit" @click="editDeclaredPower">{{ declaredPower || '-' }}</span>
      <input v-if="edit" type="text" class="form-control" v-model="declaredPower" @blur="saveDeclaredPower" />
    </td>
    <!-- <td v-if="powerDrop.status">
        <button type="button" @click="acknowledgeDrop()" class="button bg-green">Acknowledge</button>
        <button type="button" @click="ignorePowerDrop()" class="button bg-yellow">Ignore</button>
    </td>
    <td v-if="powerDropIgnored">
      Ignored
      <button type="button" @click="liftIgnore()" class="bg-blue1 button liftBtn">LIFT</button>
    </td> -->
    <StationPowerDropCols  :powerDropIgnored="powerDropIgnored" :powerDrop="powerDrop" 
                  @emitAcknowledgeDrop="acknowledgeDrop" @emitIgnorePowerDrop="ignorePowerDrop" @emitLiftIgnore="liftIgnore"
    />
  </tr>
</template>

<script setup lang="ts">

import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { afamIVStore } from "@/stores/afamIVStore"
import { inStorage, storage } from '@/localStorage';
import { ignore, lift } from '@/helper';
import StationPowerDropCols from './inc/StationPowerDropCols.vue'
import { stationId, settings } from '@/enums';

    const stationStore = afamIVStore();
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

    const alarm = ref(false);

    const connectionStatusColor = computed(() => {
      return (isConnected.value) ? 'connected' : (isConnectionLost.value) ? 'connectionLost' : 'notConnected'
    })

    watch(vals, (currentVals) => {
        if(currentVals.mw != '' && currentVals.mw != '-') {
            prevLoad.value = currLoad.value;
            currLoad.value = currentVals.mw;
            emits('emitTotal', station.value.id, currentVals.mw);
        }
        // if(powerDrop.value.status) {
        //     emits('startAlarm');
        //     const data = {
        //       powerStationId: storeId, 
        //       load: currentVals.mw, 
        //       percentage: powerDrop.value.percentage, 
        //       timeOfDrop: new Date().toISOString(),
        //       calType: localStorage.getItem(settings.LoadDropOption)
        //     }
        //     emits('saveLoadDrop', data);
        // }
    })

    watch(() => isConnected.value, (connected) => {
      if(!connected) emits('resetTotal', station.value.id);
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
