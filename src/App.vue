<template>
  <div class="h-screen flex overflow-hidden bg-white">
    

    <sidebar v-if="user!==null" />
    <div class="flex flex-col min-w-0 flex-1 overflow-hidden">
      <div class="lg:hidden">
        <div class="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5">
          <div>
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-pink-500.svg" alt="Workflow" />
          </div>
          <div>
            <button type="button" class="-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600" @click="sidebarOpen = true">
              <span class="sr-only">Open sidebar</span>
              <MenuIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

       <router-view />

    </div>

  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import {
  MenuIcon
} from '@heroicons/vue/outline'
import getUser from './composables/getUser';



export default {
  components: {
    MenuIcon,
    Sidebar
  },
  setup() {

    const { user } = getUser();
    console.log(user.value)
    return {
      user
    }
  },
}
</script>