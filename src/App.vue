<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'App',
  mounted() {
    document.title = 'Travel Planner';
  }
});
</script>

<template>
  <router-view />
</template>
