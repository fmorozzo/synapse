<!--
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  const colors = require('tailwindcss/colors')
  
  module.exports = {
    // ...
    theme: {
      extend: {
        colors: {
          'gray': colors.blueGray,
        }
      }
    },
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ]
  }
  ```
-->
<template>


      <main class="flex-1 flex overflow-hidden">
        <div class="flex-1 flex flex-col overflow-y-auto xl:overflow-hidden">
          <!-- Breadcrumb -->
          <nav aria-label="Breadcrumb" class="bg-white border-b border-gray-200 xl:hidden">
            <div class="max-w-3xl mx-auto py-3 px-4 flex items-start sm:px-6 lg:px-8">
              <a href="#" class="-ml-1 inline-flex items-center space-x-3 text-sm font-medium text-gray-900">
                <ChevronLeftIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span>Settings</span>
              </a>
            </div>
          </nav>

          <div class="flex-1 flex xl:overflow-hidden">
            <!-- Secondary sidebar -->
            <nav aria-label="Sections" class="hidden flex-shrink-0 w-96 bg-white border-r border-gray-200 xl:flex xl:flex-col">
              <div class="flex-shrink-0 h-16 px-6 border-b border-gray-200 flex items-center">
                <p class="text-lg font-medium text-gray-900">Settings</p>
              </div>
              <div class="flex-1 min-h-0 overflow-y-auto">
                <router-link v-for="item in subNavigation" :key="item.name" :to="item.href" :class="[item.current ? 'bg-blue-50 bg-opacity-50' : 'hover:bg-blue-50 hover:bg-opacity-50', 'flex p-6 border-b border-gray-200']" :aria-current="item.current ? 'page' : undefined">
                  <component :is="item.icon" class="flex-shrink-0 -mt-0.5 h-6 w-6 text-gray-400" aria-hidden="true" @click="item.current=true" />
                  <div class="ml-3 text-sm">
                    <p class="font-medium text-gray-900">{{ item.name }}</p>
                    <p class="mt-1 text-gray-500">{{ item.description }}</p>
                  </div>
                </router-link>
              </div>
            </nav>
            <router-view />
          </div>
        </div>
      </main>
            
</template>

<script>
import { ref } from 'vue'
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  BellIcon,
  BookmarkAltIcon,
  CashIcon,
  CogIcon,
  FireIcon,
  HomeIcon,
  InboxIcon,
  KeyIcon,
  MenuIcon,
  PhotographIcon,
  SearchCircleIcon,
  UserIcon,
  ViewGridAddIcon,
  XIcon,
} from '@heroicons/vue/outline'
import { ChevronLeftIcon } from '@heroicons/vue/solid'
import Account from './settings/Account.vue'
import Notifications from './settings/Notifications.vue'

const subNavigation = [
  {
    name: 'Account',
    description: 'Ullamcorper id at suspendisse nec id volutpat vestibulum enim. Interdum blandit.',
    href: '/settings/account',
    icon: CogIcon,
    current: true,
  },
  {
    name: 'Notifications',
    description: 'Enim, nullam mi vel et libero urna lectus enim. Et sed in maecenas tellus.',
    href: '/settings/notifications',
    icon: BellIcon,
    current: false,
  },
  {
    name: 'Appearance',
    description: 'Magna nulla id sed ornare ipsum eget. Massa eget porttitor suscipit consequat.',
    href: '#',
    icon: PhotographIcon,
    current: false,
  },
  {
    name: 'Billing',
    description: 'Orci aliquam arcu egestas turpis cursus. Lectus faucibus netus dui auctor mauris.',
    href: '#',
    icon: CashIcon,
    current: false,
  },
  {
    name: 'Integrations',
    description: 'Nisi, elit volutpat odio urna quis arcu faucibus dui. Mauris adipiscing pellentesque.',
    href: '#',
    icon: ViewGridAddIcon,
    current: false,
  },
  {
    name: 'Additional Resources',
    description: 'Quis viverra netus donec ut auctor fringilla facilisis. Nunc sit donec cursus sit quis et.',
    href: '#',
    icon: SearchCircleIcon,
    current: false,
  },
]

export default {
  components: {
      Account,
      Notifications,
    Dialog,
    DialogOverlay,
    TransitionChild,
    TransitionRoot,
    ChevronLeftIcon,
    MenuIcon,
    XIcon,
  },
  setup() {
    const mobileMenuOpen = ref(false)
    const subNavigate = (item) => {
      
    }
    return {
      subNavigation,
      mobileMenuOpen,
      subNavigate
    }
  },
}
</script>