import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId } from '@/enums';
import { values, getAverage } from '@/utilities';
import { useEketStore } from './useEketStore';
import { useEkimStore } from './useEkimStore';
import { mergeVals } from '@/helper';

export const ibomStore = defineStore('ibom', () => {
    const stationStore = ref(initializeStation('ibom'));

    const eketStore = useEketStore();
    const ekimStore = useEkimStore();

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
    const eketIsConnected = computed(() => eketStore.isConnected);
    const ekimIsconnected = computed(() => ekimStore.isConnected);
    const eketIsConnectionLost = computed(() => eketStore.isConnectionLost);
    const ekimIsConnectionLost = computed(() => ekimStore.isConnectionLost);
    // track that eket and ekim are connected
    const stationsConnected = computed(() => {
        let status = (eketIsConnected.value || ekimIsconnected.value) ? true : false;
        console.log('ibom connection status:', status);
        connected.value = status;
        return status;
    })

    watch(stationsConnected, (prev, next) => {
        // this watch only serves to trigger stationsConnected which in turn sets the connected value
        // console.log('connection status prev', prev);
        // console.log('connection status next', next);
    })
    // track whether eket and ekim connection is lost
    const stationsConnectionLost = computed(() => {
        let status = (eketIsConnectionLost.value && ekimIsConnectionLost.value) ? true : false;
        connectionLost.value = status;
        return status;

    })
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);

    const eketLastConnected = computed(() => eketStore.lastConnected);
    const ekimLastConnected = computed(() => ekimStore.lastConnected);
    const lastConnected = computed(() => {
        return (eketLastConnected.value > ekimLastConnected.value) ? eketLastConnected.value : ekimLastConnected.value;
    });
    const eketVals = computed(() => eketStore.vals);
    const ekimVals = computed(() => ekimStore.vals);
    const mergedVals = computed(() => {
        let merged = mergeVals(eketVals.value, ekimVals.value);
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
