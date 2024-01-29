import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'jebba';

export const jebbaStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation(stationId.Jebba));

    const { VITE_POWER_SAMPLE_SIZE } = import.meta.env;

    const connected = ref(false);
    const connectionLost = ref(false);
    const lastConnectedTime = ref(); 

    const mw = ref();
    const mx = ref();
    const kv = ref();

    const powerSampleArr = ref<string[]>([]);
    const powerTarget = ref(0);
    const referencePower = ref(0);

    const powerDrop = ref<powerDropType>({
        drop: 0, status: false, percentage: 0
    })

    watch(() => powerSampleArr.value.length, () => {
        let arr = powerSampleArr.value;
        let SampleSize = (inStorage(settings.SampleSize)) ? storage(settings.SampleSize) : VITE_POWER_SAMPLE_SIZE;
        if(arr.length >= SampleSize) {
            // console.log("equals to sample size for jebba", powerTarget.value, arr);
            powerTarget.value = getAverage(arr);
            referencePower.value = powerTarget.value;
            // powerSampleArr.value = [];
            powerSampleArr.value.shift(); // remove the first/oldest element from the array
        }
    })

    function set (data: stationType) {
        stationStore.value = {...data};
        mw.value = getPower(data.sections, true);
        mx.value = getMvar(data.sections, true);
        kv.value = getVoltage(data.sections);

        // checking for sudden power drop below the threshold
        let loadDropOption = localStorage.getItem(settings.LoadDropOption);
        let declaredPower = localStorage.getItem(storeId);

        if(loadDropOption && loadDropOption == settings.DeclaredPower && declaredPower) {
            powerTarget.value = parseFloat(declaredPower);
            referencePower.value = powerTarget.value;
        }else{
            powerSampleArr.value.push(mw.value.pwr);
        }
        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr), storeId);
        if(drop) powerDrop.value = drop;
        if(drop?.status) {
            powerSampleArr.value = []; // clear the sample array if load drop is flagged
            powerTarget.value = 0;
        }

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
        if(lastConnectedTime.value != undefined) {
            if(Math.abs(currentTime() - lastConnectedTime.value) >= import.meta.env.VITE_MAX_NO_UPDATE_TIME) disconnected();
        }else{
            if(connected.value) disconnected();
        }
    }

    function acknowledgePowerDrop () {
        powerDrop.value = {drop: 0, status: false, percentage: 0};
    }

    const station = computed(() => stationStore.value)
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);
    const lastConnected = computed(() => lastConnectedTime.value);
    const vals = computed(() => values(mw.value, mx.value, kv.value));
    const targetPower = computed(() => powerTarget.value);
    const referenceLoad = computed(() => referencePower.value);
    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals, targetPower, referenceLoad,
                set, disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
