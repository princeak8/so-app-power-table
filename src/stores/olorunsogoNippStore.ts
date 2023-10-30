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
    const stationStore = ref(initializeStation('olorunsogoNipp'));
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

    function acknowledgePowerDrop () {
        powerDrop.value = {drop: 0, status: false};
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
                let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr));
                if(drop) powerDrop.value = drop;
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
        }else{
            powerSampleArr.value.push(val.mw);
        }
        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(val.mw), storeId);
        if(drop) powerDrop.value = drop;
    })

    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals,
                set, disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
