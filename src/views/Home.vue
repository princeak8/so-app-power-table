<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold text-green-800 text-center mb-6">GENERATION LOSS DETECTION SYSTEM</h1>

        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Power Stations</h2>
            <h2 class="text-xl font-bold">Total: {{ total.toLocaleString('en-US') }}MW</h2>
            <audio ref="alarm" src="alarm/alert-alarm-1.wav"></audio>
        </div>

        <table class="w-full border-collapse border border-gray-300 font-bold">
            <thead>
                <tr class="bg-black text-white font-extrabold">
                    <th class="border border-gray-300 p-2">S/N</th>
                    <th class="border border-gray-300 p-2">Station</th>
                    <th class="border border-gray-300 p-2">Power(MW)</th>
                    <th class="border border-gray-300 p-2">REACTIVE POWER (MVar)</th>
                    <th class="border border-gray-300 p-2">VOLTAGE (kV)</th>
                    <th class="border border-gray-300 p-2">STATUS</th>
                    <th class="border border-gray-300 p-2">Declared Load</th>
                </tr>
            </thead>
            <tbody>
                <StationRow
                    v-for="(station, i) in stationStores"
                    :key="i"
                    :sn="i + 1"
                    :name="station.name"
                    :store="station.store()"
                    :showDetails="station.showDetails"
                    classes="border border-gray-300 p-2"
                    @emitTotal="getStationTotal"
                    @resetTotal="resetStationTotal"
                    @startAlarm="startAlarm"
                    @stopAlarm="stopAlarm"
                    @saveLoadDrop="saveLoadDrop"
                    @acknowledge="AcknowledgeStationIncidence"
                />
                <tr>
                    <td colspan="6" class="border border-gray-300 p-2 text-right font-bold">Total:</td>
                    <td class="border border-gray-300 p-2 font-bold">{{ total.toLocaleString('en-US') }}MW</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';
    // import TheWelcome from '../components/TheWelcome.vue'
    // import AfamIV from '@/components/AfamIV.vue';
    // import AfamV from '@/components/AfamV.vue';
    // import AfamVI from '@/components/AfamVI.vue';
    import stationComponents from '@/stationComponents';
    import stationStores from '@/stationStores'
    import axios from "axios";
    import { type saveDropData, type acknowledgeStationData } from "@/types";
    import { inStorage, storage, putInStorage } from '@/localStorage';
    import { settings } from '@/enums';
    import { retrieveLoadDropsFromStorage } from '@/helper';
    import StationRow from '@/components/StationRow.vue';

    // console.log('stores', stationStores);

    const stationsTotal= ref<Record<string, any>>({});
    const alarm = ref<HTMLAudioElement | null>(null);

    const numberWithCommas = (x:string) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function saveLoadDrop(data:saveDropData) {
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
        let loadDrops = (inStorage(settings.LoadDropsData)) ? retrieveLoadDropsFromStorage() : [];
        loadDrops.push(data);
        putInStorage(settings.LoadDropsData, JSON.stringify(loadDrops));
    }

    function AcknowledgeStationIncidence(data: acknowledgeStationData) {
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
        stationsTotal.value[id] = total;
    }

    const resetStationTotal = (id: string) => {
        stationsTotal.value[id] = 0;
    }

    const total = computed(() => {
        if(stationsTotal.value != undefined) {
            let t = Object.values(stationsTotal.value).reduce((total, curr) => total + parseFloat(curr.toString()), 0);
            return numberWithCommas(t.toFixed(2));
        }
        return 0;
    })
</script>