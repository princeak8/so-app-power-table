<template>
    <!-- <TheWelcome /> -->
    <div class="content-container" style="border: none;">
        <div class="heading">
            <h1>CONFIGURATION</h1>
        </div>

        <table class="table-bordered">
            <tr style="padding-top: 2em; border: 1;">
                <td style="width: 40%;" class="table-column">Maximum allowed Load Drop(MW)</td>
                <td style="width: 40%;" class="table-column">
                    <span v-if="editTarget != settings.MaxLoadDrop">{{ maxLoadDrop }}</span>
                    <input class="form-control" v-if="editTarget == settings.MaxLoadDrop" v-model='editValue' />
                </td>
                <SettingsButtons :editTarget="editTarget" :value="settings.MaxLoadDrop" @emitSave="save" @emitsCancel="cancel" @emitsEdit="edit" />
            </tr>

            <tr style="padding-top: 2em; border: 1;">
                <td style="width: 40%;" class="table-column">Maximum Percentage Load Drop</td>
                <td style="width: 40%;" class="table-column">
                    <span v-if="editTarget != settings.LoadDrop">{{ loadDrop }}</span>
                    <input class="form-control" v-if="editTarget == settings.LoadDrop" v-model='editValue' />
                </td>
                <SettingsButtons :editTarget="editTarget" :value="settings.LoadDrop" @emitSave="save" @emitsCancel="cancel" @emitsEdit="edit" />
            </tr>

            <tr style="padding-top: 2em; border: 1;">
                <td style="width: 40%;" class="table-column">Sample Size</td>
                <td style="width: 40%;" class="table-column">
                    <span v-if="editTarget != settings.SampleSize">{{ sampleSize }}</span>
                    <input class="form-control" v-if="editTarget == settings.SampleSize" v-model='editValue' />
                </td>
                <SettingsButtons :editTarget="editTarget" :value="settings.SampleSize" @emitSave="save" @emitsCancel="cancel" @emitsEdit="edit" />
            </tr>

            <tr style="padding-top: 2em;">
                <td style="width: 40%;" class="table-column">Calculation Option</td>
                <td style="width: 40%;" class="table-column">
                    <span v-if="editTarget != settings.LoadDropOption">{{ calculationOption }}</span>
                    <select v-if="editTarget == settings.LoadDropOption" v-model="editValue" class="form-control">
                        <option :value="settings.DeclaredPower">Declared Power</option>
                        <option :value="settings.AveragePower" selected>Average Power</option>
                    </select>
                </td>
                <SettingsButtons :editTarget="editTarget" :value="settings.LoadDropOption" @emitSave="save" @emitsCancel="cancel" @emitsEdit="edit" />
            </tr>
        </table>
    </div>
</template>

<style scoped>
    .table-column {
        text-align: center; padding-top: 1em; padding-bottom: 1em;
    }
    .button {
        font-size: 1em; height: 2em; border-radius: 0.5em; 
    }
</style>


<script setup lang="ts">
    import { ref } from 'vue';
    // import { save as saveToStorage } from "@/services/DbService";
    import { settings } from '@/enums';
    import SettingsButtons from '../components/inc/SettingsButtons.vue';
    const { VITE_POWER_SAMPLE_SIZE, VITE_MAX_LOAD_DROP_THRESHOLD, VITE_MAX_LOAD_DROP } = import.meta.env;
    // import "bootstrap/dist/css/bootstrap.min.css";
    // import "bootstrap";



    if(localStorage.getItem(settings.LoadDrop) == null) localStorage.setItem(settings.LoadDrop, VITE_MAX_LOAD_DROP_THRESHOLD.toString());

    if(localStorage.getItem(settings.MaxLoadDrop) == null) localStorage.setItem(settings.MaxLoadDrop, VITE_MAX_LOAD_DROP.toString());

    if(localStorage.getItem(settings.SampleSize) == null) localStorage.setItem(settings.SampleSize, VITE_POWER_SAMPLE_SIZE.toString());
    
    if(localStorage.getItem(settings.LoadDropOption) == null) localStorage.setItem(settings.LoadDropOption, settings.AveragePower);

    let editTarget = ref('');
    let editValue = ref();
    let maxLoadDrop = ref(localStorage.getItem(settings.MaxLoadDrop));
    let loadDrop = ref(localStorage.getItem(settings.LoadDrop));
    let sampleSize = ref(localStorage.getItem(settings.SampleSize))
    let calculationOption = ref(localStorage.getItem(settings.LoadDropOption));

    const edit = (val: string) => {
        editTarget.value = val;
        let value = localStorage.getItem(val) || '';
        // editValue.value = (value == '') ? value : parseFloat(value);
        editValue.value = value;
        console.log(editValue.value);
    }
    const cancel = () => {
        editTarget.value = '';
    }

    const save = () => {
        let key = editTarget.value;
        let val = editValue.value;
        localStorage.setItem(key, val.toString());
        updateData(key);
        cancel();
    }

    const updateData = (key: string) => {
        switch(key) {
            case settings.MaxLoadDrop : maxLoadDrop.value = localStorage.getItem(settings.MaxLoadDrop); break;
            case settings.LoadDrop : loadDrop.value = localStorage.getItem(settings.LoadDrop); break;
            case settings.SampleSize : sampleSize.value = localStorage.getItem(settings.SampleSize); break;
            case settings.LoadDropOption : calculationOption.value = localStorage.getItem(settings.LoadDropOption);
        }
    }


</script>