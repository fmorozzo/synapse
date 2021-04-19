<template>
  
    <!-- Static sidebar for desktop -->
    <div class="hidden lg:flex lg:flex-shrink-0">
      <div class="flex flex-col w-64">
        <!-- Sidebar component, swap this element with another sidebar if you like -->
        <div class="flex flex-col h-0 flex-1 border-r border-gray-200 bg-gray-100">
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4">
              <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-pink-500-mark-gray-900-text.svg" alt="Workflow" />
            </div>
            <nav class="mt-5 flex-1" aria-label="Sidebar">
              <div class="px-2 space-y-1">
                <router-link v-for="item in navigation" :key="item.name" :to="item.href" :class="[item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']" :aria-current="item.current ? 'page' : undefined">
                  <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 h-6 w-6']" aria-hidden="true" />
                  {{ item.name }}
                </router-link>
              </div>
              <hr class="border-t border-gray-200 my-5" aria-hidden="true" />
              <div class="flex-1 px-2 space-y-1">
                <router-link v-for="item in secondaryNavigation" :key="item.name" :to="item.href" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <component :is="item.icon" class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" aria-hidden="true" />
                  {{ item.name }}
                </router-link>
              </div>
            </nav>
          </div>
          <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
            <a href="#" class="flex-shrink-0 w-full group block">
              <div class="flex items-center">
                <div>
                  <img class="inline-block h-9 w-9 rounded-full" :src="user.imageUrl" alt="" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {{ user.name }}
                  </p>
                  <p class="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    View profile
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
</template>

<script>

import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {

  CogIcon,
  HomeIcon,
  MenuIcon,
  SearchCircleIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ViewListIcon,
  XIcon,
} from '@heroicons/vue/outline'
import { ChevronLeftIcon, FilterIcon, MailIcon, PhoneIcon, SearchIcon } from '@heroicons/vue/solid'

const user = {
  name: 'Tom Cook',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'My Collection', href: '/collection', icon: SearchCircleIcon, current: false },
  { name: 'My Circles', href: '/circles', icon: UserGroupIcon, current: false },
  { name: 'DJ Charts', href: '/charts', icon: ViewListIcon, current: false },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon, current: false }
]
const secondaryNavigation = [
  { name: 'Settings', href: '/settings/account', icon: CogIcon }
]

export default {
  components: {
    Dialog,
    DialogOverlay,
    TransitionChild,
    TransitionRoot,
    ChevronLeftIcon,
    FilterIcon,
    MailIcon,
    MenuIcon,
    PhoneIcon,
    SearchIcon,
    XIcon,
  },
  setup() {

    return {
        user,
      navigation,
      secondaryNavigation
    }
  },
}
</script>

<style>

</style>