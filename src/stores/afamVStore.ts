import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId } from '@/enums';
import { values, getAverage } from '@/utilities';

export const afamVStore = defineStore('afamV', () => {
    const afamV = ref(initializeStation(stationId.AfamV));

    const connected = ref(false);
    const connectionLost = ref(false);
    const lastConnectedTime = ref(); 

    const mw = ref();
    const mx = ref();
    const kv = ref();

    const powerSampleArr = ref<string[]>([]);
    const powerTarget = ref(0);

    const powerDrop = ref<powerDropType>({
        drop: 0, status: false
    })

    watch(powerSampleArr, (arr) => {
        if(arr.length >= import.meta.env.VITE_POWER_SAMPLE_SIZE) {
            powerTarget.value = getAverage(arr);
            powerSampleArr.value = [];
        }
    })

    function set (data: stationType) {
        afamV.value = {...data};
        mw.value = getPower(data.sections, true);
        mx.value = getMvar(data.sections, true);
        kv.value = getVoltage(data.sections);

        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr));
        if(drop) powerDrop.value = drop;

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

    function acknowledgePowerDrop () {
        powerDrop.value = {drop: 0, status: false};
    }

    const station = computed(() => afamV.value)
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);
    const lastConnected = computed(() => lastConnectedTime.value);
    const vals = computed(() => values(mw.value, mx.value, kv.value));
    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

  return { 
            station, isConnected, isConnectionLost, lastConnected, powerDrop, vals,
            set, disconnected, connect, checkConnection, acknowledgePowerDrop 
        }
})
