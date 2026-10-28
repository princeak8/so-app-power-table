import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type sectionType, type stationType, type powerDropType, type singleStoreValsType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId, settings } from '@/enums';
import { values, getAverage } from '@/utilities';
import { inStorage, storage } from '@/localStorage';

const storeId = 'olorunsogoGas';

export const olorunsogoStore = defineStore(storeId, () => {
    const stationStore = ref(initializeStation(stationId.OlorunsogoGas));
    const { VITE_POWER_SAMPLE_SIZE } = import.meta.env;

    const connected = ref(false);
    const connectionLost = ref(false);
    const lastConnectedTime = ref<number>();

    const mw = ref();
    const mx = ref();
    const kv = ref();
    const t = ref<string>();

    const powerSampleArr = ref<string[]>([]);
    const powerTarget = ref(0);
    const referencePower = ref(0);

    const currPower = ref(0);
    const prevPower = ref(0);

    const powerDrop = ref<powerDropType>({
        drop: 0, status: false, percentage: 0
    });

    watch(() => powerSampleArr.value.length, () => {
        let arr = powerSampleArr.value;
        let SampleSize = (inStorage(settings.SampleSize)) ? storage(settings.SampleSize) : VITE_POWER_SAMPLE_SIZE;
        if(arr.length >= SampleSize) {
            powerTarget.value = getAverage(arr);
            referencePower.value = powerTarget.value;
            powerSampleArr.value.shift(); // remove the first/oldest element from the array
        }
    });

    function set (data: stationType | any) {
        // Normalize sections from data.sections or data.units
        let sections: sectionType[] = [];
        if (data.sections && Array.isArray(data.sections)) {
            sections = data.sections;
        } else if (data.units && Array.isArray(data.units)) {
            sections = data.units.map((unit: any) => ({
                id: unit.id,
                data: unit.data || unit.pd || unit.td || unit.gd
            }));
        }

        stationStore.value = { ...data, sections };
        mw.value = getPower(sections, true);
        mx.value = getMvar(sections, true);
        kv.value = getVoltage(sections);
        t.value = data.t;

        // Checking for sudden power drop below threshold
        let loadDropOption = localStorage.getItem(settings.LoadDropOption);
        let declaredPower = localStorage.getItem(storeId) || localStorage.getItem('olorunsogo');

        prevPower.value = currPower.value;
        currPower.value = mw.value ? parseFloat(mw.value.pwr) : 0;

        if (loadDropOption && loadDropOption === settings.DeclaredPower && declaredPower) {
            powerTarget.value = parseFloat(declaredPower);
            referencePower.value = powerTarget.value;
        } else if (mw.value?.pwr) {
            powerSampleArr.value.push(mw.value.pwr);
        }

        let drop = checkPowerDrop(powerTarget.value, currPower.value, prevPower.value, storeId);
        if (drop) powerDrop.value = drop;
        if (drop?.status) {
            powerSampleArr.value = []; // clear sample array if load drop is flagged
            powerTarget.value = 0;
        }

        connect();
        lastConnectedTime.value = currentTime();
    }

    function disconnected () {
        connected.value = false;
        connectionLost.value = true;
    }

    function connect () {
        connected.value = true;
        connectionLost.value = false;
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

    const station = computed(() => stationStore.value);
    const isConnected = computed(() => connected.value);
    const isConnectionLost = computed(() => connectionLost.value);
    const lastConnected = computed(() => lastConnectedTime.value);

    // Backward-compatible mergedVals for olorunsogoNippStore calculation
    const mergedVals = computed((): singleStoreValsType => {
        return {
            power: mw.value ?? { pwr: '0', status: false },
            mvar: mx.value ?? { pwr: '0', status: false },
            voltage: kv.value ?? { value: 0, status: false },
            t: t.value ?? ''
        };
    });

    const vals = computed(() => {
        let val = values(mw.value, mx.value, kv.value);
        let time = t.value;
        return { ...val, t: time };
    });

    const timeSinceLastConnection = computed(() => {
        return (lastConnectedTime.value != undefined) ? Math.abs((currentTime() - lastConnectedTime.value)) : false;
    });

    const targetPower = computed(() => powerTarget.value);
    const referenceLoad = computed(() => referencePower.value);
    const prevLoad = computed(() => prevPower.value);

    return {
        station,
        isConnected,
        isConnectionLost,
        lastConnected,
        powerDrop,
        vals,
        mergedVals,
        targetPower,
        referenceLoad,
        prevLoad,
        timeSinceLastConnection,
        set,
        disconnected,
        connect,
        checkConnection,
        acknowledgePowerDrop
    };
});
