<template>
<div class="py-10">
  <div class=" max-w-7xl mx-auto sm:px-6 lg:px-8 bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- Replace with your content -->
          <!-- This example requires Tailwind CSS v2.0+ -->
          <div>
            <div class="flow-root mt-6">
              <ul class="-my-5 divide-y divide-gray-200">
                <li class="py-4"  v-for="track in documents" :key="track.id">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixqx=rg0LJKySl7&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{track.artist}} - {{track.title}}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{track.track}} - {{ track.duration }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{track.tracks}}
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

import getCollection from '../composables/getCollection'
export default {
    props:{},
    setup(){
        const { error, documents } = getCollection('tracks')
        console.log(documents)
        return { error, documents }
    }
}
</script>

<style>

</style>