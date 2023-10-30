<template>
    <td v-if="powerDrop.status">
        <button type="button" @click="acknowledgeDrop()" class="button bg-green">Acknowledge</button>
        <button type="button" @click="ignorePowerDrop()" class="button bg-yellow">Ignore</button>
    </td>
    <td v-if="powerDropIgnored">
      Ignored
      <button type="button" @click="liftIgnore()" class="bg-blue1 button liftBtn">LIFT</button>
    </td>
</template>

<script setup lang="ts">

    const props = defineProps(['powerDrop','powerDropIgnored']);

    const emits = defineEmits(['emitAcknowledgeDrop', 'emitIgnorePowerDrop', 'emitLiftIgnore']);

    const acknowledgeDrop = () => emits('emitAcknowledgeDrop');

    const ignorePowerDrop = () => emits('emitIgnorePowerDrop');

    const liftIgnore = () => emits('emitLiftIgnore');
    

</script>

<style scoped>

</style>
