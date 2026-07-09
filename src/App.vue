<script setup lang="ts">
import { ref, onMounted } from 'vue';

class Candidate {
  name: string;
  vote: number = 0;
  disabled: boolean;

  constructor(name: string, disabled: boolean) {
    this.name = name;
    this.disabled = disabled;
  }
}

const candidates = ref<Candidate[]>([]);

onMounted(async () => {
  const dataResponse = await fetch('./namelist');
  const namelist = await dataResponse.text();
  const lines = namelist
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));

  for (const line of lines) {
    const words = line.split(/\s+/);
    if (!words[0]) continue;
    candidates.value.push(new Candidate(words[0], words.length === 2 && words[1] === 'disabled'));
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="grid gap-2" v-for="candidate in candidates" :key="candidate.name"></div>
    <!-- <ul class="space-y-2">
      <li v-for="candidate in candidates" :key="candidate.name" >
        <span :class="{ 'line-through': candidate.disabled }">{{ candidate.name }}</span>
      </li>
    </ul> -->
  </div>
</template>
