<!-- This example requires Tailwind CSS v2.0+ -->
<template>

 
<main class="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last p-4">
   <div class="pb-5 border-b border-gray-200 mb-5">
    <h3 class="text-lg leading-6 font-medium text-gray-900">
      DJ Charts
    </h3>
  </div>
  <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <li v-for="chart in charts" :key="chart.id" class="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200">
      <div class="flex-1 flex flex-col p-8">
        <img class="w-32 h-32 flex-shrink-0 mx-auto bg-black rounded-full" :src="chart.imageUrl" alt="" />
        <h3 class="mt-6 text-gray-900 text-sm font-medium">{{ chart.artist }}</h3>
        <dl class="mt-1 flex-grow flex flex-col justify-between">
          <dt class="sr-only">Title</dt>
          <dd class="text-gray-500 text-sm">{{ chart.title }}</dd>
          <dt class="sr-only">Genre</dt>
          <dd class="my-3">
            <span v-for="genre in chart.genre" :key="genre" class="px-2 m-1 py-1 text-pink-800 text-xs font-medium bg-pink-100 rounded-full">{{ genre }}</span>
          </dd>
          <dt class="sr-only">Affinity</dt>
          <dd class="text-gray-500 text-sm">Affinity : <span class="text-pink-500 text-lg font-bold">{{ chart.affinity }}%</span></dd>
          <dt class="sr-only">Followers</dt>
          <dd class="text-pink-500 text-lg font-bold">{{ chart.followers }} <span class="font-normal text-gray-500 text-sm">syners</span></dd>
        </dl>
      </div>
      <div>
        <div class="-mt-px flex divide-x divide-gray-200">
          <div class="w-0 flex-1 flex">
            <a href="#" class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-400 font-medium border border-transparent rounded-bl-lg hover:text-white hover:bg-pink-500">
              <EyeIcon class="w-5 h-5 hover:text-white" aria-hidden="true" />
              <span class="ml-3 hidden">view</span>
            </a>
          </div>
          <div class="-ml-px w-0 flex-1 flex">
            <a href="#" class="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-400 font-medium border border-transparent rounded-br-lg hover:text-white hover:bg-pink-500">
              <ThumbUpIcon class="w-5 h-5" aria-hidden="true" />
              <span class="ml-3 hidden">Follow</span>
            </a>
          </div>
        </div>
      </div>
    </li>
  </ul>
</main>
</template>

<script>
import { ThumbUpIcon, EyeIcon } from '@heroicons/vue/outline'

const charts = [
  {
    artist: 'Cassius Select',
    title: 'Dekmantel Podcast 316',
    genre: ['Breaks', 'Broken Beats'],
    followers: 98,
    affinity: 70,
    created: '+1-202-555-0170',
    imageUrl: 'https://i1.sndcdn.com/artworks-EuO80UBrjJ46hhRR-7I6OIA-t500x500.jpg',
    id: 1
  },
  {
    artist: 'Octo Octa',
    title: 'RA.769',
    genre: ['House'],
    followers: 98,
    affinity: 87,
    created: '2021-12-02',
    imageUrl: 'https://i1.sndcdn.com/artworks-WGDLLaRuS0NRyw6Z-rpS68Q-t500x500.jpg',
    id: 2
  },
  {
    artist: 'Renata Do Valle',
    title: 'Dekmantel Podcast 315',
    genre: ['Chicago House', 'House'],
    followers: 234,
    affinity: 55,
    created: '2021-01-11',
    imageUrl: 'https://i1.sndcdn.com/artworks-zL82QEEGnn7bbvKf-sk0P4A-t500x500.jpg',
    id: 3
  },
  {
    artist: 'Logic1000',
    title: 'RA.764',
    genre: ['Uk garage'],
    followers: 98,
    affinity: 70,
    created: '+1-202-555-0170',
    imageUrl: 'https://i1.sndcdn.com/artworks-PfqkQgtxLo5e45j5-mV4bRQ-t500x500.jpg',
    id: 4
  },
  {
    artist: 'Logic1000',
    title: 'RA.764',
    genre: ['Uk garage'],
    followers: 98,
    affinity: 70,
    created: '+1-202-555-0170',
    imageUrl: 'https://i1.sndcdn.com/artworks-PfqkQgtxLo5e45j5-mV4bRQ-t500x500.jpg',
    id: 5
  },
  {
    artist: 'Logic1000',
    title: 'RA.764',
    genre: ['Uk garage'],
    followers: 98,
    affinity: 70,
    created: '+1-202-555-0170',
    imageUrl: 'https://i1.sndcdn.com/artworks-PfqkQgtxLo5e45j5-mV4bRQ-t500x500.jpg',
    id: 6
  }
]

export default {
  components: {
    EyeIcon,
    ThumbUpIcon,
  },
  setup() {
    return {
      charts,
    }
  },
}
</script>