<template>
  <div class="py-10">
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Search
        </h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Replace with your content -->
        <div class="px-4 py-8 sm:px-0">

            <search />

        </div>
        <!-- /End replace -->
      </div>
    </main>
  </div>
</template>

<script>
import Search from '../components/Search.vue'
export default {
    components: { Search }

}
</script>

<style>

</style>