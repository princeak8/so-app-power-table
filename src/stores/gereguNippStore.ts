import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'gereguNipp';

export const gereguNippStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation(stationId.GereguNipp));

    const { VITE_POWER_SAMPLE_SIZE } = import.meta.env;

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

    watch(() => powerSampleArr.value.length, () => {
        let arr = powerSampleArr.value;
        let SampleSize = (inStorage(settings.SampleSize)) ? storage(settings.SampleSize) : VITE_POWER_SAMPLE_SIZE;
        if(arr.length >= SampleSize) {
            powerTarget.value = getAverage(arr);
            powerSampleArr.value = [];
        }
    })

    function set (data: stationType) {
        stationStore.value = {...data};
        const values = extractValues(data.sections);
        mw.value = values.pwr;
        mx.value = values.mvar;
        kv.value = values.voltage;

        // checking for sudden power drop below the threshold
        let loadDropOption = localStorage.getItem(settings.LoadDropOption);
        let declaredPower = localStorage.getItem(storeId);

        if(loadDropOption && loadDropOption == settings.DeclaredPower && declaredPower) {
            powerTarget.value = parseFloat(declaredPower);
        }else{
            powerSampleArr.value.push(mw.value.pwr);
        }
        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr), storeId);
        if(drop) powerDrop.value = drop;

        connect();
        lastConnectedTime.value = Math.round(new Date().getTime() / 1000);
    }

    function extractValues (data: sectionType[]) {
        let totalMw = 0;
        let totalMx = 0;
        let kv = 0;
        let gasMw = 0;
        let gasMx = 0;
        let mwStatus = false;
        let mxStatus = false;
        let kvStatus = false;
        let linesIds = ['r1j', 'r2j'];

        data.forEach((section) => {
            let mw = parseFloat(section.data.mw.toString());
            let mx = parseFloat(section.data.mvar.toString());
            let v = parseFloat(section.data.V.toString());
            if(!Number.isNaN(mw)) {
                mwStatus = true;
                mw = (mw < 0) ? (mw * -1) : mw;
                if(linesIds.includes(section.id)) {
                    totalMw += mw;
                }else{
                    gasMw += mw;
                }
            }
            if(!Number.isNaN(mx)) {
                mxStatus = true;
                mx = (mx < 0) ? (mx * -1) : mx;
                if(linesIds.includes(section.id)) {
                    totalMx += mx;
                }else{
                    gasMx += mx;
                }
            }
            if(!Number.isNaN(v)) {
                kvStatus = true;
                kv = (linesIds.includes(section.id) && v > kv) ? v : kv
            }
        });
        let mw = totalMw - gasMw;
        let mx = totalMx - gasMx;
        return {
                    pwr: {pwr: mw.toFixed(2), status: mwStatus}, 
                    mvar: {pwr: mx.toFixed(2), status: mxStatus}, 
                    voltage: {value: parseInt(kv.toString()), status: kvStatus}
                }
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
        powerDrop.value = {drop: 0, status: false};
    }

    const station = computed(() => stationStore.value)
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);
    const lastConnected = computed(() => lastConnectedTime.value);
    const vals = computed(() => values(mw.value, mx.value, kv.value));
    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    })

  return { station, isConnected, isConnectionLost, lastConnected, powerDrop, vals,
                set, disconnected, connect, checkConnection, acknowledgePowerDrop 
            }
})
