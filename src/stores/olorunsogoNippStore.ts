import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { olorunsogoStore } from './olorunsogoStore';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'olorunsogoNipp';

export const olorunsogoNippStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation(stationId.OlorunsogoLines));
    const olorunsogoGasStore = olorunsogoStore();

    const connected = ref(false);
    const connectionLost = ref(false);
    const lastConnectedTime = ref(); 

    const mw = ref(); 
    const mx = ref();
    const kv = ref();

    const power = ref();
    const mvar = ref();
    const voltage = ref();

    const powerSampleArr = ref<string[]>([]);
    const powerTarget = ref(0);
    const referencePower = ref(0);

    const currPower = ref(0);
    const prevPower = ref(0);

    const powerDrop = ref<powerDropType>({
        drop: 0, status: false, percentage: 0
    })

    watch(powerSampleArr, (arr) => {
        if(arr.length >= import.meta.env.VITE_POWER_SAMPLE_SIZE) {
            powerTarget.value = getAverage(arr);
            referencePower.value = powerTarget.value;
            // powerSampleArr.value = [];
            powerSampleArr.value.shift(); // remove the first/oldest element from the array
        }
    })

    function set (data: stationType) {
        stationStore.value = {...data};
        mw.value = getPower(data.sections);
        mx.value = getMvar(data.sections);
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
    const olorunsogoVals = computed(() => olorunsogoGasStore.mergedVals);
    // const vals = computed(() => values(mw.value, mx.value, kv.value));
    const vals = computed(() => {
        let power = mw.value;
        let mvar = mx.value;
        if(power != undefined && mvar != undefined) {
            let {power:olorunsogoMw, mvar:olorunsogoMx} = olorunsogoVals.value;
            let pwr = (power.status) ? (parseFloat(power.pwr) - parseFloat(olorunsogoMw.pwr)) : 0;
            let mxPwr = (mvar.status) ? (parseFloat(mvar.pwr) - parseFloat(olorunsogoMx.pwr)) : 0;

            // checking for sudden power drop below the threshold
            if(mw.value != undefined) {
                let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr), prevPower.value, storeId);
                if(drop) powerDrop.value = drop;
                if(drop?.status) {
                    powerSampleArr.value = []; // clear the sample array if load drop is flagged
                    powerTarget.value = 0;
                }
            }
            power = {pwr: pwr.toFixed(2), status: (power.status && olorunsogoMw.status)};
            mvar = {pwr: mxPwr.toFixed(2), status: (mvar.status && olorunsogoMx.status)};
        }

        return values(power, mvar, kv.value);
    })

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
    })

    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

    const targetPower = computed(() => powerTarget.value);
    const referenceLoad = computed(() => referencePower.value);
    const prevLoad = computed(() => prevPower.value);

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals, targetPower, referenceLoad, prevLoad,
                set, disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
