
<template>
   <p class="my-5 text-gray-500 italic">Currently retrieving my collection from a airtable database.({{records.length}})</p>

            <!-- This example requires Tailwind CSS v2.0+ -->
<div class="bg-white shadow overflow-hidden sm:rounded-md">
  <ul class="divide-y divide-gray-200">
    <li v-for="record in records" :key="record.id">
      <a href="#" class="block hover:bg-gray-50">
        <div class="flex items-center px-4 py-4 sm:px-6">
          <div class="min-w-0 flex-1 flex items-center">
            <div class="flex-shrink-0">
              <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixqx=rg0LJKySl7&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
            </div>
            <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <p class="text-sm font-medium text-indigo-600 truncate">{{record.fields.Artist}}</p>
                <p class="mt-2 flex items-center text-sm text-gray-500">
                  <!-- Heroicon name: solid/mail -->
                  <span class="truncate">{{record.fields.Title}}</span>
                </p>
              </div>
              <div class="hidden md:block">
                <div>
                  <p class="text-sm text-gray-900">
                    
                    {{ record.fields.Label }}
                  </p>
                  <p class="mt-2 flex items-center text-sm text-gray-500">
                    <!-- Heroicon name: solid/check-circle -->
                    Released on:&nbsp;<time datetime="2020-01-07"> {{record.fields.Released }}</time>
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
      </a>
    </li>
  </ul>
</div>
    
</template>

<script>
import axios from 'axios';

export default {
  name: 'ListRecords',
  data: function () {
    return {
      apiUrl: 'https://api.airtable.com/v0/',
      apiKey: 'keyQKXuzuIIC7c8Ph', // Always use a read-only account token
      appID:'app0Z70uYtVAdttHi',
      base: '/Records',
      sort: 'sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=Artist',
      records: []
    };
  },
  mounted: function () {
    this.getData();
  },
  methods: {
    getData: function () {
      axios({
        url: this.apiUrl + this.appID + this.base + '?' + this.sort,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }).then((res) => {
        this.records = res.data.records;
        console.log (this.records)
      });
    }
  }
}        
</script>

<style>

</style>
