<template>
  <div class="pb-2 relative mx-auto text-gray-600">
        <!-- image search box -->
            <div class="box mb-4">
                <div class="box-wrapper">

                    <div class=" bg-white rounded flex items-center w-full p-3 shadow-sm border border-gray-200">
                      <button @click="key()" class="outline-none focus:outline-none"><svg class=" w-5 text-gray-600 h-5 cursor-pointer" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
                      <input type="search" name="" id="" @keydown.enter="key()" placeholder="search for images" v-model="query" class="w-full pl-4 text-sm outline-none focus:outline-none bg-transparent">
                      <div class="select">
                        <select name="" id="" v-model="searchField" class="text-sm outline-none focus:outline-none bg-transparent">
                          <option value="Artist" selected >Artists</option>
                          <option value="Title">Titles</option>
                          <option value="Label">Label</option>
                         </select>
                      </div>
                    </div>
                  
                </div>
            </div>


      <records-list :records="records" />
      </div>

</template>

<script>
import RecordsList from './RecordsList.vue';
export default {
  components: { RecordsList },
    name: 'ListRecords',
    data: function () {
        return {
        apiUrl: 'https://api.airtable.com/v0/',
        apiKey: 'keyQKXuzuIIC7c8Ph', // Always use a read-only account token
        appID:'app0Z70uYtVAdttHi',
        base: '/Records',
        sort: 'sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=',
        formula: '',
        searchField:'',
        query:'',
        url:'',
        records:{}
        };
    },
    mounted: function () {},
    methods: {
        getData: function () {
            axios({
                url: this.apiUrl + this.appID + this.base + '?' +this.formula + '&' + this.sort + this.searchField,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }).then((res) => {
                this.records = res.data.records;
                console.log (this.records)
            });
        },
        key: function(event) {
            this.formula = 'filterByFormula=SEARCH(LOWER(%22' + this.query + '%22)%2C+LOWER(' + this.searchField + '))',
            console.log(this.apiUrl + this.appID + this.base + '?' +this.formula + '&' + this.sort)
            this.getData()
        }
    }   
}
</script>

<style>

</style>