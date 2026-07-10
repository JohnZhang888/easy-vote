<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { BadgeCheckIcon, ChevronRightIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

class Candidate {
  vote: number = 0;
  tag: string = ""; //预留给以后版本 
}

const candidates = ref(new Map<string, Candidate>());

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
    candidates.value.set(words[0], new Candidate);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="grid gap-2 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
      <div
        v-for="([name, candidate]) in candidates"
        :key="name"
        class="flex h-8 w-full items-center border border-black/20 bg-gray-50"
      >
        <input type="checkbox" />
        <span>{{ name }}</span>
      </div>
      <div class="flex w-full max-w-md flex-col gap-6">
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Basic Item</ItemTitle>
        <ItemDescription>
          A simple item with title and description.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Action
        </Button>
      </ItemActions>
    </Item>
    <Item variant="outline" size="sm" as-child>
      <a href="#">
        <ItemMedia>
          <BadgeCheckIcon class="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </a>
    </Item>
  </div>
    </div>
  </div>
</template>
