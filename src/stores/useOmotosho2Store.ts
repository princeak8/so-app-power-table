import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId } from '@/enums';

export const useOmotosho2Store = defineStore('useOmotosho2', () => {
    const stationStore = ref(initializeStation(stationId.Eket));

    const connected = ref(false);
    const connectionLost = ref(false);
    const lastConnectedTime = ref(); 

    const mw = ref();
    const mx = ref();
    const kv = ref();

    function set (data: stationType) {
        stationStore.value = {...data};
        mw.value = getPower(data.sections, true);
        mx.value = getMvar(data.sections, true);
        kv.value = getVoltage(data.sections);

        connect();
        lastConnectedTime.value = Math.round(new Date().getTime() / 1000);
    }

    function disconnected () {
        connected.value = false;
        connectionLost.value = true;
    }

    function connect () {
        connected.value = true;
    }

    function checkConnection () {
        if(timeSinceLastConnection.value && timeSinceLastConnection.value >= import.meta.env.VITE_MAX_NO_UPDATE_TIME) {
            disconnected();
        }
    }

    const station = computed(() => stationStore.value)
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);
    const lastConnected = computed(() => lastConnectedTime.value);
    const vals = computed((): singleStoreValsType => {
        return {power: mw.value, voltage: kv.value, mvar: mx.value} 
    });
    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

  return { station, isConnected, isConnectionLost, lastConnected, vals,
                set, disconnected, connect, checkConnection 
            }
})
