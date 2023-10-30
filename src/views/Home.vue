<template>
    <!-- <TheWelcome /> -->
    <div class="content-container">
        <h1 style="margin:2px; padding: 0; display: flex; flex-direction: row; justify-content: space-between;">
            <b>Power Stations</b>
            <b>Total: {{ total.toLocaleString('en-US') }}Mw</b>
        </h1>

        <table border="1" class="table table-bordered" style="width: 100%; font-weight: bold;">
            <thead>
                <tr>
                    <th>S/N</th>
                    <th>Station</th>
                    <th>Power(Mw)</th>
                    <th>REACTIVE POWER (Mvar)</th>
                    <th>VOLTAGE (Kv)</th>
                    <th>STATUS</th>
                    <th>Declared Load</th>
                </tr>
            </thead>
            <tbody>
                <!-- <component :is="AfamIV" :sn="1" @emitTotal="getStationTotal" />
                <component :is="AfamV" :sn="2" @emitTotal="getStationTotal" /> -->
                <component v-for="(station, n) in stationComponents" :is="station" :sn="n+1" @emitTotal="getStationTotal" />
                Total: {{ total.toLocaleString('en-US') }}
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

    const stationsTotal= ref<Record<string, any>>({});

    const numberWithCommas = (x:string) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


    const getStationTotal = (id: string, total: any) => {
        // console.log('id: ', id);
        // console.log('total', total);
        stationsTotal.value[id] = total;
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