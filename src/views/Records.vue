<template>
    <div class="py-10 bg-gray-100">
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Records
        </h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Replace with your content -->
        <div class="px-4 py-8 sm:px-0">
            <div v-if="error">{{ error }}</div>
        



<div v-if="documents">
<p class="mb-3 text-gray-500 italic">Currently retrieving my collection from a airtable database.({{documents.length}})</p>

<!-- This example requires Tailwind CSS v2.0+ -->
<div class="bg-white shadow overflow-hidden sm:rounded-md">
  <ul class="divide-y divide-gray-200">
    <li v-for="record in documents" :key="record.id" @click="goto">

      <router-link :to="{name: 'RecordDetails', params: { releaseID: record.releaseID, recordTitle: record.title }}" class="block hover:bg-gray-50">
        <div class="flex items-center px-4 py-4 sm:px-6">
          <div class="min-w-0 flex-1 flex items-center">
            <div class="flex-shrink-0">
              <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixqx=rg0LJKySl7&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
            </div>
            <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <p class="text-sm font-medium text-indigo-600 truncate">{{record.artist}}</p>
                <p class="mt-2 flex items-center text-sm text-gray-500">
                  <!-- Heroicon name: solid/mail -->
                  <span class="truncate">{{record.title}}</span>
                </p>
              </div>
              <div class="hidden md:block">
                <div>
                  <p class="text-sm text-gray-900">
                    
                    {{ record.label }}
                  </p>
                  <p class="mt-2 flex items-center text-sm text-gray-500">
                    <!-- Heroicon name: solid/check-circle -->
                    Released on:&nbsp;<time datetime="2020-01-07"> {{record.releasedYear }}</time>
                  </p>
                </div> 
              </div>
            </div>
          </div>
          <div>
            <!-- Heroicon name: solid/chevron-right -->
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </router-link>
    </li>
  </ul>
</div>
    </div>
        
        </div>
        <!-- /End replace -->
      </div>
    </main>
  </div>




</template>

<script>
import getCollection from '../composables/getCollection'
export default {
    setup(){
        const { error, documents } = getCollection('records')
        console.log(documents)
        return { error, documents }
    }
}
</script>

<style>

</style>