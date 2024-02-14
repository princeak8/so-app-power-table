import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage, mergeVals } from '@/helper';
import { useEketStore } from './useEketStore';
import { useEkimStore } from './useEkimStore';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'ibom';

export const ibomStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation('ibom'));

    const { VITE_POWER_SAMPLE_SIZE } = import.meta.env;

    const eketStore = useEketStore();
    const ekimStore = useEkimStore();

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
    const eketIsConnected = computed(() => eketStore.isConnected);
    const ekimIsconnected = computed(() => ekimStore.isConnected);
    const eketIsConnectionLost = computed(() => eketStore.isConnectionLost);
    const ekimIsConnectionLost = computed(() => ekimStore.isConnectionLost);
    // track that eket and ekim are connected
    const stationsConnected = computed(() => {
        let status = (eketIsConnected.value || ekimIsconnected.value) ? true : false;
        // console.log('ibom connection status:', status);
        connected.value = status;
        return status;
    })

    //DO NOT DELETE THIS WATCH
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

    watch(() => vals.value, (val) => {
        // console.log('watching ibom vals', val)
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

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals, targetPower, referenceLoad, prevLoad,
                disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
