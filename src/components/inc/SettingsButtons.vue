<template>
    <td style="width: 20%;" class="table-column">
        <button v-if="props.editTarget != props.value" type="button" style="background-color: #CAE4F1" class="button" @click="edit(props.value)">Edit</button>
        <div v-if="props.editTarget == props.value">
            <button type="button" style="background-color: #5cb85c" class="button" @click="save()">Save</button>
            <button type="button" style="background-color: #f0ad4e" class="button" @click="cancel">Cancel</button>
        </div>
    </td>
  </template>
  
  <script setup lang="ts">
  
  import { settings } from '@/enums';

    const props = defineProps({
        editTarget: String,
        value: String
    });
    const emits = defineEmits(['emitSave', 'emitsCancel', 'emitsEdit']);

    const save = () => {
        emits('emitSave');
    }

    const cancel = () => {
        emits('emitsCancel');
    }

    const edit = (val) => {
        emits('emitsEdit', val);
    }
  
  </script>
  
  <style scoped>
  .table-column {
      text-align: center; padding-top: 1em; padding-bottom: 1em;
  }
  .button {
      font-size: 1em; height: 2em; border-radius: 0.5em; 
  }
</style>
  