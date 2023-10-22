import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { type dataType, type sectionType, type stationType, type powerDropType } from "@/types/index";
import { initializeStation, currentTime, checkPowerDrop, getPower, getMvar, getVoltage } from '@/helper';
import { stationId } from '@/enums';
import { values, getAverage } from '@/utilities';

export const afamIVStore = defineStore('afamIV', () => {
  const afamIV = ref(initializeStation(stationId.AfamIV));

  const connected = ref(false);
  const connectionLost = ref(false);
  const lastConnectedTime = ref(); 

  const mw = ref();
  const mx = ref();
  const kv = ref();
  // sample of power values pushed into an array to be used to get the average value for the purpose of calculating power drop
  const powerSampleArr = ref<string[]>([]);
  const powerTarget = ref(0);
  const powerDrop = ref<powerDropType>({
    drop: 0, status: false
  })

    function set (data: stationType) {
        afamIV.value = {...data};
        mw.value = getPower(data.sections, true);
        mx.value = getMvar(data.sections, true);
        kv.value = getVoltage(data.sections);
        powerSampleArr.value.push(mw.value);
        
        // checking for sudden power drop below the threshold
        let drop = checkPowerDrop(powerTarget.value, parseFloat(mw.value.pwr));
        if(drop) powerDrop.value = drop;
        connect();
        lastConnectedTime.value = Math.round(new Date().getTime() / 1000);
    }

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
        // console.log('connected', connected.value);
    }

    function checkConnection () {
        // console.log('lastConnected:', lastConnectedTime.value+ ' current time:', currentTime.value);
        // console.log('time since last connection:', timeSinceLastConnection.value + 'Secs; '+currentTime.value+' - '+lastConnectedTime.value);
        if(timeSinceLastConnection.value && timeSinceLastConnection.value >= 60) {
            disconnected();
        }
    }

    function acknowledgePowerDrop () {
        powerDrop.value = {drop: 0, status: false};
        // console.log('drop acknowledged');
    }

    // lastConnected: 1695654091 current time: 1695654089
    // time since last connection: -2 1695654089 - 1695654091

    const station = computed(() => afamIV.value)
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
