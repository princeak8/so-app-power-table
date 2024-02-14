import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage, mergeVals } from '@/helper';
import { useOlorunsogo1Store } from './useOlorunsogo1Store';
import { useOlorunsogo2Store } from './useOlorunsogo2Store';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'olorunsogo';

export const olorunsogoStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation(stationId.OlorunsogoGas));
    const { VITE_POWER_SAMPLE_SIZE } = import.meta.env;
    /*
        Station1 and station2 represents the two stations that are been added together to get the value for the power station
    */
    const station1Store = useOlorunsogo1Store();
    const station2Store = useOlorunsogo2Store();

    const connected = ref(false);
    const connectionLost = ref(false);

    const powerSampleArr = ref<string[]>([]);
    const powerTarget = ref(0);
    const referencePower = ref(0);
    const currPower = ref(0);
    const prevPower = ref(0);

    const powerDrop = ref<powerDropType>({
        drop: 0, status: false, percentage: 0
    })

    watch(() => powerSampleArr.value.length, () => {
        let arr = powerSampleArr.value;
        let SampleSize = (inStorage(settings.SampleSize)) ? storage(settings.SampleSize) : VITE_POWER_SAMPLE_SIZE;
        if(arr.length >= SampleSize) {
            powerTarget.value = getAverage(arr);
            referencePower.value = powerTarget.value;
            // powerSampleArr.value = [];
            powerSampleArr.value.shift(); // remove the first/oldest element from the array
        }
    })

    function disconnected () {
        connected.value = false;
        connectionLost.value = true;
    }

    function connect () {
        connected.value = true;
    }

    function checkConnection () {
        if(lastConnected.value != undefined) {
            if(Math.abs(currentTime() - lastConnected.value) >= import.meta.env.VITE_MAX_NO_UPDATE_TIME) disconnected();
        }else{
            if(connected.value) disconnected();
        }
    }

    function acknowledgePowerDrop () {
        powerDrop.value = {drop: 0, status: false, percentage: 0};
    }

    const station = computed(() => stationStore.value)
    const station1IsConnected = computed(() => station1Store.isConnected);
    const station2Isconnected = computed(() => station2Store.isConnected);
    const station1IsConnectionLost = computed(() => station1Store.isConnectionLost);
    const station2IsConnectionLost = computed(() => station2Store.isConnectionLost);
    // track that station1 and station2 are connected
    const stationsConnected = computed(() => {
        let status = (station1IsConnected.value || station2Isconnected.value) ? true : false;
        // console.log('olorunsogo connection status:', status);
        connected.value = status;
        return status;
    })

    watch(stationsConnected, (prev, next) => {
        // this watch only serves to trigger stationsConnected which in turn sets the connected value
        // console.log('connection status prev', prev);
        // console.log('connection status next', next);
    })
    // track whether station1 and station2 connection is lost
    const stationsConnectionLost = computed(() => {
        let status = (station1IsConnectionLost.value && station2IsConnectionLost.value) ? true : false;
        connectionLost.value = status;
        return status;

    })
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);

    const station1LastConnected = computed(() => station1Store.lastConnected);
    const station2LastConnected = computed(() => station2Store.lastConnected);
    const lastConnected = computed(() => {
        return (station1LastConnected.value > station2LastConnected.value) ? station1LastConnected.value : station2LastConnected.value;
    });
    const station1Vals = computed(() => station1Store.vals);
    const station2Vals = computed(() => station2Store.vals);
    const mergedVals = computed(() => {
        let merged = mergeVals(station1Vals.value, station2Vals.value);
        // console.log('merged', merged);
        return merged;
    });
    
    const vals = computed(() => {
        // console.log('merged vals', mergedVals);
        let {power, mvar, voltage} = mergedVals.value;
        return values(power, mvar, voltage);
    });

    watch(() => vals.value, (val) => {
        // checking for sudden power drop below the threshold
        let loadDropOption = localStorage.getItem(settings.LoadDropOption);
        let declaredPower = localStorage.getItem(storeId);

        if(loadDropOption && loadDropOption == settings.DeclaredPower && declaredPower) {
            powerTarget.value = parseFloat(declaredPower);
            referencePower.value = powerTarget.value;
        }else{
            powerSampleArr.value.push(val.mw);
        }

        prevPower.value = currPower.value;
        currPower.value = parseFloat(val.mw);

        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(val.mw), prevPower.value, storeId);
        if(drop) powerDrop.value = drop;
        if(drop?.status) {
            powerSampleArr.value = []; // clear the sample array if load drop is flagged
            powerTarget.value = 0;
        }
    })

    const timeSinceLastConnection = computed(() => {
        return (lastConnected.value != undefined) ? Math.abs((currentTime() - lastConnected.value)) : false;
    })

    const targetPower = computed(() => powerTarget.value);
    const referenceLoad = computed(() => referencePower.value);
    const prevLoad = computed(() => prevPower.value);

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals, mergedVals, targetPower, referenceLoad, prevLoad,
                disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
