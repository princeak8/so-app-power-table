<template>
    <!-- <TheWelcome /> -->
    <div class="content-container">
        <h1 style="color: #355E3B; font-weight: bold;">GENERATION LOSS DETECTION SYSTEM</h1>

        <h1 style="margin:2px; padding: 0; display: flex; flex-direction: row; justify-content: space-between;">
            <b>Power Stations</b>
            <b>Total: {{ total.toLocaleString('en-US') }}MW</b>
            <audio ref="alarm" src="alarm/alert-alarm-1.wav"></audio>
            <!-- <button @click="startAlarm">Start Alarm</button> -->
            <!-- <button @click="saveLoadDrop">Save Incidence</button> -->
            <!-- <p>{{ Date() }}</p> -->
            <!-- <button @click="AcknowledgeIncidence">Acknowledge Incidence</button>  -->
        </h1>

        <table border="1" class="table table-bordered" style="width: 100%; font-weight: bold;">
            <thead>
                <tr>
                    <th>S/N</th>
                    <th>Station</th>
                    <th>Power(MW)</th>
                    <th>REACTIVE POWER (MVar)</th>
                    <th>VOLTAGE (kV)</th>
                    <th>STATUS</th>
                    <th>Declared Load</th>
                </tr>
            </thead>
            <tbody>
                <!-- <component :is="AfamIV" :sn="1" @emitTotal="getStationTotal" />
                <component :is="AfamV" :sn="2" @emitTotal="getStationTotal" /> -->
                <component v-for="(station, n) in stationComponents" :is="station" :sn="n+1" 
                    @emitTotal="getStationTotal" @resetTotal="resetStationTotal" 
                    @startAlarm="startAlarm" @stopAlarm="stopAlarm"
                    @saveLoadDrop="saveLoadDrop" @acknowledge="AcknowledgeStationIncidence"
                />
                Total: {{ total.toLocaleString('en-US') }}MW
            </tbody>
        </table>
    </div>
</template>


<script setup lang="ts">
    import { ref, computed } from 'vue';
    import TheWelcome from '../components/TheWelcome.vue'
    import AfamIV from '@/components/AfamIV.vue';
    import AfamV from '@/components/AfamV.vue';
    import AfamVI from '@/components/AfamVI.vue';
    import stationComponents from '@/stationComponents';
    import axios from "axios";
    import { type saveDropData, type acknowledgeStationData } from "@/types";
    import { inStorage, storage, putInStorage } from '@/localStorage';
    import { settings } from '@/enums';
    import { retrieveLoadDropsFromStorage } from '@/helper';

    const stationsTotal= ref<Record<string, any>>({});
    const alarm = ref<HTMLAudioElement | null>(null);

    const numberWithCommas = (x:string) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function saveLoadDrop(data:saveDropData) {
        // console.log('save');
        // const data = {
        //     "powerStationId" : 'alaoji', 
        //     "load": 400, 
        //     "percentage": 20, 
        //     "timeOfDrop": new Date().toISOString(),
        //     "calType": "average-power"
        // }
        data.calType = (inStorage(settings.LoadDropOption)) ? String(storage(settings.LoadDropOption)) : String(import.meta.env.VITE_DB_CAL_TYPE);
        const url = `${import.meta.env.VITE_DB_URL}load_drop/save`;
        axios.post(url, data)
        .then((res) => {
            // console.log("response:", res);
        })
        .catch((err) => {
            console.log("error saving load drop:", err);
            storeLoadDropInStorage(data);
        })
    }

    function storeLoadDropInStorage(data:saveDropData) {
        // console.log('storing load drop in storage');
        let loadDrops = (inStorage(settings.LoadDropsData)) ? retrieveLoadDropsFromStorage() : [];
        loadDrops.push(data);
        putInStorage(settings.LoadDropsData, JSON.stringify(loadDrops));
    }

    function AcknowledgeStationIncidence(data: acknowledgeStationData) {
        // const data = {
        //     "identifier" : "gbarain",  
        //     "acknowledgedAt": "2024-01-10 12:17:03"
        // }
        const url = `${import.meta.env.VITE_DB_URL}load_drop/acknowledge_station`;
        axios.post(url, data)
        .then((res) => {
            console.log("response:", res);
        })
        .catch((err) => {
            console.log("error:", err);
        })
    }

    function startAlarm() {
        // console.log('alarm started');
        if (alarm.value) {
            alarm.value.play();
        }
    }

    const stopAlarm = () => {
        if (alarm.value) {
            alarm.value.pause();
            alarm.value.currentTime = 0;
        }
    };

    const getStationTotal = (id: string, total: any) => {
        // console.log('id: ', id);
        // console.log('total', total);
        stationsTotal.value[id] = total;
    }

    const resetStationTotal = (id: string) => {
        stationsTotal.value[id] = 0;
    }

    const total = computed(() => {
        // console.log()
        if(stationsTotal.value != undefined) {
            // console.log(Object.values(stationsTotal.value));
            // return 0
            let t = Object.values(stationsTotal.value).reduce((total, curr) => total + parseFloat(curr.toString()), 0);
            return numberWithCommas(t.toFixed(2));
        }
        return 0;
    })
</script>