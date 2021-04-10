<template>
  <div class="pb-2 relative mx-auto text-gray-600">
  
        <!-- image search box -->
            <div class="box mb-4">
                <div class="box-wrapper">

                    <div class=" bg-white rounded flex items-center w-full p-3 shadow-sm border border-gray-200">
                      <button @click="handleChange" class="outline-none focus:outline-none"><svg class=" w-5 text-gray-600 h-5 cursor-pointer" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
                      <input type="search" name="" id="" @keydown.enter="handleChange" @change="handleChange" placeholder="search for a record in your library" v-model="query" class="w-full pl-4 text-sm outline-none focus:outline-none bg-transparent">
                      <div class="select">
                        <select name="" id="" v-model="field" @change="handleChange" class="text-sm outline-none focus:outline-none bg-transparent">
                          <option value="Artist" selected >Artists</option>
                          <option value="Title">Titles</option>
                          <option value="Label">Label</option>
                         </select>
                      </div>
                    </div>
                  
                </div>
            </div>

        <div v-if="isCalled">
            <div v-if="!isStatusOK">
                Loading ...
            </div>
            <div v-else>
                <div v-if="!isSuccess">
                    No record matches this search : <strong>{{ field }} : {{ query }}</strong>
                </div>
                <div v-else >
                    <h3><strong>Field:</strong> {{ field }} - <strong>String:</strong> {{ query }}</h3>
                    <records-list :records="records" />
                </div>
            </div>
        </div>
        <div v-else>
            <p>Enter the name of the artist you are looking for.</p>
        </div>
    </div>
</template>

<script>
import RecordsList from './RecordsList.vue';
import getRecords from '../composables/getRecords'
import { ref } from '@vue/reactivity';

export default {
  components: { RecordsList },
    name: 'Search',

    setup(props,context) {
        const field = ref('Artist')
        const query = ref('')

        const { records , searchQueryByField, isCalled, isStatusOK, isSuccess, error } = getRecords()

        const handleChange = async () => {
            await searchQueryByField(field.value, query.value)
            if(!error.value){
                context.emit('recordsRetrieved')
                console.log(records.value)
            }
        }
        return { handleChange, records, isSuccess, isStatusOK, isCalled, query, field }
    }
        
}
</script>

<style>

</style>