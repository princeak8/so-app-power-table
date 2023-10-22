import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId } from '@/enums';
import { values, getAverage } from '@/utilities';
import { useOmotosho1Store } from './useOmotosho1Store';
import { useOmotosho2Store } from './useOmotosho2Store';
import { mergeVals } from '@/helper';

export const omotoshoStore = defineStore('omotosho', () => {
    const stationStore = ref(initializeStation('omotosho'));
    /*
        Station1 and station2 represents the two stations that are been added together to get the value for the power station
    */
    const station1Store = useOmotosho1Store();
    const station2Store = useOmotosho2Store();

    const connected = ref(false);
    const connectionLost = ref(false);

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

    const station = computed(() => stationStore.value)
    const station1IsConnected = computed(() => station1Store.isConnected);
    const station2Isconnected = computed(() => station2Store.isConnected);
    const station1IsConnectionLost = computed(() => station1Store.isConnectionLost);
    const station2IsConnectionLost = computed(() => station2Store.isConnectionLost);
    // track that station1 and station2 are connected
    const stationsConnected = computed(() => {
        let status = (station1IsConnected.value || station2Isconnected.value) ? true : false;
        console.log('ibom connection status:', status);
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
    const timeSinceLastConnection = computed(() => {
        return (lastConnected.value != undefined) ? Math.abs((currentTime() - lastConnected.value)) : false;
    })

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals,
                disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
