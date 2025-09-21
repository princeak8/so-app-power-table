<template>
    <div style="margin-right: auto; margin-left: auto; width:100%; height:700px; overflow: scroll;">
        <table border="1" class="table" style="width: 100%; font-weight: bold; position:relative; ">
            <thead style="font-weight:bold;">
                <th><b>S/N</b></th>
                <th><b>STATION</b></th>
                <th><b>PRE-CONTINGENCY(MW)</b></th>
                <th><b>LOAD DROP(MW)(%drop)</b></th>
                <th><b>POST-CONTINGENCY(%)</b></th>
                <th><b>CALCULATION TYPE</b></th>
                <th><b>TIME OF DROP</b></th>
            </thead>
            <tbody style="height:50px;">
                <tr v-if="loadDrops != undefined && loadDrops.length > 0" v-for="(loadDrop, i) in loadDrops">
                    <td class="center border border-gray-300 p-2">{{ i+1 }}</td>
                    <td class="center border border-gray-300 p-2">{{ loadDrop.station.name }}</td>
                    <td class="center border border-gray-300 p-2">{{ loadDrop.referenceLoad }}MW</td>
                    <td class="center border border-gray-300 p-2">{{ (loadDrop.referenceLoad - loadDrop.load).toFixed(2) }}MW({{ loadDrop.refLoadPercentage }}%)</td>
                    <td class="center border border-gray-300 p-2">{{ loadDrop.load }}MW</td>
                    <!-- td class="center"{{ loadDrop.previousLoad }}MW({{ loadDrop.prevLoadPercentage }}%)</td> -->
                    <td class="center border border-gray-300 p-2">{{ loadDrop.calculationType }}</td>
                    <td class="center border border-gray-300 p-2">{{ loadDrop.timeOfDrop }}</td>
                </tr>
                <tr v-else> No load drops found </tr>
            </tbody>
        </table>
    </div>
</template>



<style scoped>
    table th {
        position: sticky;
        top: 0;
        background-color: #FFF;
    }
    table th b {
        font-weight: bolder;
    }
</style>

<script setup lang="ts">
    import { type PropType } from 'vue';
    import { type loadDropData} from "../../types";

    const props = defineProps({
        loadDrops: {
            type: Object as PropType<loadDropData[]>
        }
    });

    // const prevLoadPercentage = computed(() => percentage(loadDrop.load, loadDrop.previousLoad));
    // const refLoadPercentage = computed(() => percentage(loadDrop.load, loadDrop.referenceLoad));

    // console.log(prevLoadPercentage);

    const percentage = (firstVal: number, secondVal: number) => {
        let diff = firstVal - secondVal;
        return ((diff/firstVal) * 100).toFixed(2);
    }
</script>