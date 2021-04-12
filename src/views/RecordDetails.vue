<template>
  <div class="py-10">
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 

<!-- This example requires Tailwind CSS v2.0+ -->
    <div class="pb-5 border-b border-gray-200">
    <h3 v-if="tracks.length" class="text-2xl leading-6 font-medium text-gray-900">
        {{tracks[0].fields.Artist}}
    </h3>
    <p class="mt-2 max-w-4xl text-sm text-gray-500">{{recordTitle}}</p>
    </div>

  

      </div>
    </header>
<div class=" max-w-7xl mx-auto sm:px-6 lg:px-8 bg-white shadow overflow-hidden sm:rounded-lg">
  <div class="px-4 py-5 sm:px-6">





    <main>
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Replace with your content -->
<!-- This example requires Tailwind CSS v2.0+ -->
<div>
  <div class="flow-root mt-6">
    <ul class="-my-5 divide-y divide-gray-200">
      <li class="py-4"  v-for="track in tracks" :key="track.fields.Track_id">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixqx=rg0LJKySl7&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{track.fields.Artist}} - {{track.fields.Title}}
            </p>
            <p class="text-sm text-gray-500 truncate">
              {{track.fields.Track}} - {{ track.fields.Duration }}
            </p>
            <p class="text-sm text-gray-500 truncate">
              {{track.fields.Tracks}}
            </p>
          </div>
          <div>
            <a href="#" class="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
              View
            </a>
          </div>
        </div>
      </li>

    </ul>
  </div>
</div>

        <!-- /End replace -->
      </div>
    </main>
  </div>
  </div>
  </div>
</template>

<script>

import getTracks from '../composables/getTracks'
import { ref } from '@vue/reactivity';

export default {
    props: ['releaseID', 'recordTitle'],
    components: {  },
    name: 'RecordDetails', 

    setup(props,context) {
        const releaseID = ref(props['releaseID'])
        const record = ref(props['record'])
        const { tracks , searchTracksByReleaseID, isCalled, isStatusOK, isSuccess, error } = getTracks()

        const handleChange = async () => {

            console.log('RecordDetails/handleChange -> releaseID : ' + releaseID.value)
            await searchTracksByReleaseID(releaseID.value)
            if(!error.value){
                context.emit('TracksRetrieved')
                console.log('Tracks.. : ',tracks.value)
            }
        }
        return { handleChange, tracks, isSuccess, isStatusOK, isCalled, releaseID, record }
    },
    mounted() {
        this.handleChange()
    }
        
}
</script>

<style>

</style>