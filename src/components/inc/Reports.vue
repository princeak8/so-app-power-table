<template>
    <div style="margin-right: auto; margin-left: auto; width:100%; height:700px; overflow: scroll;">
        <table border="1" class="table" style="width: 100%; font-weight: bold; position:relative; ">
            <thead style="font-weight:bold;">
                <td style="position: sticky; top: 0; background-color: grey;"><b>S/N</b></td>
                <th style="position: sticky; top: 0; background-color: grey;"><b>STATION</b></th>
                <th style="position: sticky; top: 0; background-color: grey;"><b>PRE-CONTINGENCY(MW)</b></th>
                <th style="position: sticky; top: 0; background-color: grey;"><b>LOAD DROP(MW)(%drop)</b></th>
                <th style="position: sticky; top: 0; background-color: grey;"><b>POST-CONTINGENCY(%drop)</b></th>
                <th style="position: sticky; top: 0; background-color: grey;"><b>CALCULATION TYPE</b></th>
                <th style="position: sticky; top: 0; background-color: grey;"><b>TIME OF DROP</b></th>
            </thead>
            <tbody style="height:50px;">
                <tr v-if="loadDrops.length > 0" v-for="(loadDrop, i) in loadDrops">
                    <td class="center">{{ i+1 }}</td>
                    <td class="center">{{ loadDrop.station.name }}</td>
                    <td class="center">{{ loadDrop.referenceLoad }}MW</td>
                    <td class="center">{{ loadDrop.load }}MW({{ loadDrop.refLoadPercentage }}%)</td>
                    <td class="center">{{ loadDrop.previousLoad }}MW({{ loadDrop.prevLoadPercentage }}%)</td>
                    <td class="center">{{ loadDrop.calculationType }}</td>
                    <td class="center">{{ loadDrop.timeOfDrop }}</td>
                </tr>
                <tr v-else> No load drops found </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, PropType } from 'vue';
    import { type loadDropData} from "../../types";

    const props = defineProps({
        loadDrops: {
            type: Object as PropType<loadDropData[]>
        }
    });

    // const prevLoadPercentage = computed(() => percentage(loadDrop.load, loadDrop.previousLoad));
    // const refLoadPercentage = computed(() => percentage(loadDrop.load, loadDrop.referenceLoad));

    // console.log(prevLoadPercentage);

    const percentage = (firstVal, secondVal) => {
        let diff = firstVal - secondVal;
        return ((diff/firstVal) * 100).toFixed(2);
    }
</script>