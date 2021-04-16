<!--
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ]
  }
  ```
-->
<template>
  <div class="h-screen flex overflow-hidden bg-white">
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" static class="fixed inset-0 flex z-40 lg:hidden" @close="sidebarOpen = false" :open="sidebarOpen">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>
        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
          <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" @click="sidebarOpen = false">
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div class="flex-shrink-0 flex items-center px-4">
                <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-pink-500-mark-gray-900-text.svg" alt="Workflow" />
              </div>
              <nav aria-label="Sidebar" class="mt-5">
                <div class="px-2 space-y-1">
                  <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-base font-medium rounded-md']" :aria-current="item.current ? 'page' : undefined">
                    <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-4 h-6 w-6']" aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </div>
                <hr class="border-t border-gray-200 my-5" aria-hidden="true" />
                <div class="px-2 space-y-1">
                  <a v-for="item in secondaryNavigation" :key="item.name" :href="item.href" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                    <component :is="item.icon" class="text-gray-400 group-hover:text-gray-500 mr-4 h-6 w-6" aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </div>
              </nav>
            </div>
            <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
              <a href="#" class="flex-shrink-0 group block">
                <div class="flex items-center">
                  <div>
                    <img class="inline-block h-10 w-10 rounded-full" :src="user.imageUrl" alt="" />
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      {{ user.name }}
                    </p>
                    <p class="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                      View profile
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </TransitionChild>
        <div class="flex-shrink-0 w-14" aria-hidden="true">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </Dialog>
    </TransitionRoot>

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
                <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']" :aria-current="item.current ? 'page' : undefined">
                  <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 h-6 w-6']" aria-hidden="true" />
                  {{ item.name }}
                </a>
              </div>
              <hr class="border-t border-gray-200 my-5" aria-hidden="true" />
              <div class="flex-1 px-2 space-y-1">
                <a v-for="item in secondaryNavigation" :key="item.name" :href="item.href" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <component :is="item.icon" class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" aria-hidden="true" />
                  {{ item.name }}
                </a>
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
      <div class="flex-1 relative z-0 flex overflow-hidden">
        <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last">
          <!-- Breadcrumb -->
          <nav class="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden" aria-label="Breadcrumb">
            <a href="#" class="inline-flex items-center space-x-3 text-sm font-medium text-gray-900">
              <ChevronLeftIcon class="-ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>Records</span>
            </a>
          </nav>

          <article>
            <!-- Profile header -->
            <div>
              <div>
                <img class="h-32 w-full object-cover lg:h-48" src="@/assets/img/covers/oye-10.jpg" alt="" />
              </div>
              <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                  <div class="flex">
                    <img class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32" src="@/assets/img/covers/oye-10.jpg" alt="" />
                  </div>
                  <div class="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                    <div class="sm:hidden 2xl:block mt-6 min-w-0 flex-1">
                      <h1 class="text-2xl font-bold text-gray-900 truncate">
                        {{ profile.artist }} - {{ profile.title }}
                      </h1>
                      <h4 class="text-lg font-bold text-gray-600"> {{ profile.trackNumber }} - {{ profile.song }}</h4>
                    </div>
                    <div class="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <button type="button" class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                        <MailIcon class="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>Message</span>
                      </button>
                      <button type="button" class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                        <PhoneIcon class="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="hidden sm:block 2xl:hidden mt-6 min-w-0 flex-1">
                  <h1 class="text-2xl font-bold text-gray-900 truncate">
                    {{ profile.name }}
                  </h1>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="mt-6 sm:mt-2 2xl:mt-5">
              <div class="border-b border-gray-200">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <a v-for="tab in tabs" :key="tab.name" :href="tab.href" :class="[tab.current ? 'border-pink-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="tab.current ? 'page' : undefined">
                      {{ tab.name }}
                    </a>
                  </nav>
                </div>
              </div>
            </div>

            <!-- Description list -->
            <div class="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div v-for="field in Object.keys(profile.fields)" :key="field" class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">
                    {{ field }}
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ profile.fields[field] }}
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">
                    About
                  </dt>
                  <dd class="mt-1 max-w-prose text-sm text-gray-900 space-y-5" v-html="profile.about" />
                </div>
              </dl>
            </div>

            <!-- Team member list -->
            <div class="mt-8 max-w-5xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
              <h2 class="text-sm font-medium text-gray-500">Related tracks</h2>
              <div class="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div v-for="track in relatedTracks" :key="track.id" class="relative rounded-lg border border-gray-300 bg-white px-3 py-3 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                  <div class="flex-shrink-0">
                    <img class="h-16 w-16 rounded" src="@/assets/img/covers/studio58.jpeg" alt="" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <a href="#" class="focus:outline-none">
                      <span class="absolute inset-0" aria-hidden="true" />
                      <p class="text-sm font-medium text-gray-900">
                        {{ track.artist }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{ track.title }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{ track.trackNumber }} - {{ track.song }}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
        <aside class="hidden xl:order-first xl:flex xl:flex-col flex-shrink-0 w-96 border-r border-gray-200">
          <div class="px-6 pt-6 pb-4">
            <h2 class="text-lg font-medium text-gray-900">Records</h2>
            <p class="mt-1 text-sm text-gray-600">
              Search 226 records
            </p>
            <form class="mt-6 flex space-x-4" action="#">
              <div class="flex-1 min-w-0">
                <label for="search" class="sr-only">Search</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input type="search" name="search" id="search" class="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" placeholder="Search" />
                </div>
              </div>
              <button type="submit" class="inline-flex justify-center px-3.5 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                <FilterIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span class="sr-only">Search</span>
              </button>
            </form>
          </div>
          <!-- Directory list -->
          <nav class="flex-1 min-h-0 overflow-y-auto" aria-label="Directory">
            <div v-for="letter in Object.keys(records)" :key="letter" class="relative">
              <div class="z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                <h3>{{ letter }}</h3>
              </div>
              <ul class="relative z-0 divide-y divide-gray-200">
                <li v-for="record in records[letter]" :key="record.id">
                  <div class="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500">
                    <div class="flex-shrink-0">
                      <img class="h-10 w-10 rounded" src="@/assets/img/covers/oye-10.jpg" alt="" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <a href="#" class="focus:outline-none">
                        <!-- Extend touch target to entire panel -->
                        <span class="absolute inset-0" aria-hidden="true" />
                        <p class="text-sm font-medium text-gray-900">
                          {{ record.artist }}
                        </p>
                        <p class="text-sm text-gray-500 truncate">
                          {{ record.title }}
                        </p>
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  CalendarIcon,
  CogIcon,
  HomeIcon,
  MapIcon,
  MenuIcon,
  SearchCircleIcon,
  SpeakerphoneIcon,
  UserGroupIcon,
  ViewGridAddIcon,
  XIcon,
} from '@heroicons/vue/outline'
import { ChevronLeftIcon, FilterIcon, MailIcon, PhoneIcon, SearchIcon } from '@heroicons/vue/solid'

const user = {
  name: 'Tom Cook',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: false },
  { name: 'Records', href: '/records', icon: SearchCircleIcon, current: true },
  { name: 'Charts', href: '#', icon: SpeakerphoneIcon, current: false },
  { name: 'Circles', href: '#', icon: UserGroupIcon, current: false },
  { name: 'Marketplace', href: '#', icon: SpeakerphoneIcon, current: false }
]
const secondaryNavigation = [
  { name: 'Apps', href: '#', icon: ViewGridAddIcon },
  { name: 'Settings', href: '#', icon: CogIcon },
]
const tabs = [
  { name: 'Profile', href: '#', current: true },
  { name: 'Calendar', href: '#', current: false },
  { name: 'Recognition', href: '#', current: false },
]
const profile = {
    id: '678',
    artist: 'D.Y.A',
    title: '‎Oye Edits 010',
    song: 'Six Million Languages',
    trackNumber: 'B',
    imageUrl: './assets/img/cover/oye-10.jpeg',
  coverImageUrl:
    'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  about:
    '\n        <p>\n          Tincidunt quam neque in cursus viverra orci, dapibus nec tristique. Nullam ut sit dolor consectetur urna, dui cras nec sed. Cursus risus congue arcu aenean posuere aliquam.\n        </p>\n        <p>\n          Et vivamus lorem pulvinar nascetur non. Pulvinar a sed platea rhoncus ac mauris amet. Urna, sem pretium sit pretium urna, senectus vitae. Scelerisque fermentum, cursus felis dui suspendisse velit pharetra. Augue et duis cursus maecenas eget quam lectus. Accumsan vitae nascetur pharetra rhoncus praesent dictum risus suspendisse.\n        </p>\n      ',
  fields: {
    Phone: '(555) 123-4567',
    Email: 'ricardocooper@example.com',
    Title: 'Senior Front-End Developer',
    Team: 'Product Development',
    Location: 'San Francisco',
    Sits: 'Oasis, 4th floor',
    Salary: '$145,000',
    Birthday: 'June 8, 1990',
  },
}
const records = {
  A : [
    {
      "catalogID": "JEUDI 004V",
      "releaseID": 4212913,
      "tracks": "",
      "artist": "Adana Twins Ft. Digitaria",
      "title": "Reaction",
      "label": "JEUDI Records",
      "format": "12, Whi",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MATH099",
      "releaseID": 10663009,
      "tracks": "",
      "artist": "Adonis Presents Darryl Pandy",
      "title": "After Midnight EP",
      "label": "Mathematics Recordings",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "X-12015",
      "releaseID": 612436,
      "tracks": "",
      "artist": "Afrika System",
      "title": "Anikana-O",
      "label": "X-Energy Records",
      "format": "12",
      "rating": "",
      "releasedYear": 1986,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "PHS001",
      "releaseID": 14880060,
      "tracks": "",
      "artist": "Alexis Raphael",
      "title": "Digital Music Almost Killed Me",
      "label": "Paella Hair Sex",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Vitalizer001",
      "releaseID": 4507511,
      "tracks": "4507511-A,4507511-B1,4507511-B2",
      "artist": "Alkalino",
      "title": "Blood & Sweat EP",
      "label": "Vitalizer Records",
      "format": "12, EP, Promo",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LCT 007",
      "releaseID": 15813366,
      "tracks": "",
      "artist": "Amajika",
      "title": "Got My Magic Working / Tomati So",
      "label": "La Casa Tropical",
      "format": "12, Promo, W/Lbl",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ARCYDARO 02",
      "releaseID": 14804832,
      "tracks": "",
      "artist": "ARCYDARO",
      "title": "ARCYDARO 02",
      "label": "ARCYDARO",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CW001",
      "releaseID": 11872590,
      "tracks": "11872590-A1,11872590-A2,11872590-A3,11872590-A4,11872590-A5,11872590-B1,11872590-B2,11872590-B3,11872590-B4,11872590-B5",
      "artist": "Arp Frique",
      "title": "Welcome To The Colorful World Of Arp Frique",
      "label": "Colorful World Records",
      "format": "LP, Album",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HOD015",
      "releaseID": 8326344,
      "tracks": "",
      "artist": "Art Of Tones",
      "title": "Devil The Difference EP",
      "label": "House Of Disco Records",
      "format": "12, EP, Promo",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LT060",
      "releaseID": 7022652,
      "tracks": "",
      "artist": "Art Of Tones",
      "title": "The Rainbow Song",
      "label": "Local Talk",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Whyt040",
      "releaseID": 16439865,
      "tracks": "16439865-A,16439865-B1,16439865-B2",
      "artist": "Avalon Emerson",
      "title": "040",
      "label": "AD 93",
      "format": "12",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
  ],
  B : [
    {
      "catalogID": "ST 004",
      "releaseID": 10588138,
      "tracks": "",
      "artist": "Ben Penn",
      "title": "Spare Hobby / Carrera",
      "label": "Safe Trip",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CP039",
      "releaseID": 5009533,
      "tracks": "",
      "artist": "Benoit & Sergio",
      "title": "Adjustments",
      "label": "Culprit",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BWITH3",
      "releaseID": 4125012,
      "tracks": "",
      "artist": "Bill Withers",
      "title": "Who Is He (Henrik Schwarz Remix)",
      "label": "Not On Label (Bill Withers)",
      "format": "12, S/Sided, Unofficial, W/Lbl, 180",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FOLIAGE024",
      "releaseID": 4159856,
      "tracks": "",
      "artist": "Blackcoffee Feat. Soulstar (3)",
      "title": "Rock My World",
      "label": "Foliage Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BALIHU-014",
      "releaseID": 164367,
      "tracks": "",
      "artist": "Block 16",
      "title": "Electrokution",
      "label": "Balihu Records",
      "format": "12, Ltd",
      "rating": "",
      "releasedYear": 2003,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "WIGLP322",
      "releaseID": 5107143,
      "tracks": "",
      "artist": "Blood Orange (2)",
      "title": "Cupid Deluxe",
      "label": "Domino",
      "format": "2xLP, Album",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BMM90",
      "releaseID": 15725135,
      "tracks": "",
      "artist": "Boo Williams",
      "title": "Tribulation / Mental State",
      "label": "Boo Moonman",
      "format": "12, Ltd, W/Lbl, Sta",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BOO001",
      "releaseID": 8507089,
      "tracks": "",
      "artist": "Boo Williams",
      "title": "Mortal Trance Remixes",
      "label": "Not On Label",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DKMNTL051",
      "releaseID": 10212374,
      "tracks": "",
      "artist": "Bufiman",
      "title": "Peace Moves",
      "label": "Dekmantel",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
  ],
  C : [
    {
      "catalogID": "KKS 006",
      "releaseID": 8577539,
      "tracks": "",
      "artist": "Cary Crant",
      "title": "Get Dancin'",
      "label": "Kalakuta Soul Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KAT017",
      "releaseID": 4383441,
      "tracks": "",
      "artist": "Casbah 73",
      "title": "Casbah 73 Presents",
      "label": "KAT",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HM 1004/R",
      "releaseID": 16120503,
      "tracks": "16120503-A1,16120503-A1,16120503-AA",
      "artist": "Casco",
      "title": "Cybernetic Love",
      "label": "House of Music",
      "format": "12",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Italo Disco"
    },
    {
      "catalogID": "LIH023",
      "releaseID": 10493497,
      "tracks": "",
      "artist": "Cervo (3)",
      "title": "The Antlers Of God",
      "label": "Lumberjacks In Hell",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Duke048DJV",
      "releaseID": 17624,
      "tracks": "",
      "artist": "Chamber",
      "title": "Boom De Boom",
      "label": "Hydrogen Dukebox",
      "format": "12",
      "rating": "",
      "releasedYear": 1998,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "mojuba g.o.d. 3",
      "releaseID": 10812911,
      "tracks": "",
      "artist": "Chez Damier",
      "title": "Classics",
      "label": "Mojuba",
      "format": "12, Comp, RM, RP, W/Lbl",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SM-001, SM 001",
      "releaseID": 8399520,
      "tracks": "",
      "artist": "Chi-Town Gumbo",
      "title": "Love Muzik",
      "label": "Street Muzik Records & Downloads, Street Muzik Records & Downloads",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MGCP01",
      "releaseID": 10722317,
      "tracks": "",
      "artist": "Club Paradiso",
      "title": "Panoramica",
      "label": "Mondo Groove",
      "format": "12, EP, Ltd",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT047",
      "releaseID": 13568476,
      "tracks": "13568476-A1,13568476-A2,13568476-B1,13568476-B2",
      "artist": "COEO",
      "title": "COEO Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": 5,
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JLS 3054",
      "releaseID": 5275567,
      "tracks": "",
      "artist": "Cymande",
      "title": "Second Time Round",
      "label": "Janus Records",
      "format": "LP, Album, Ltd, RE, 180",
      "rating": "",
      "releasedYear": 2014,
      "genre": "Uncategorized"
    },
  ],
  D : [
    {
      "catalogID": "OYEEDIT 010",
      "releaseID": 13171647,
      "tracks": "",
      "artist": "D.Y.A",
      "title": "Oye Edits 010",
      "label": "Oye Edits",
      "format": "12, blu",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CHR-103",
      "releaseID": 5536257,
      "tracks": "",
      "artist": "DA Rebels",
      "title": "House Nation Under A Groove / It's Time To Jack The House",
      "label": "Clubhouse Records",
      "format": "12, RM",
      "rating": "",
      "releasedYear": 2014,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SHAKETAPES006",
      "releaseID": 13072216,
      "tracks": "",
      "artist": "Dan Shake",
      "title": "Volume 6",
      "label": "Shake",
      "format": "12, Ltd, 180",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RDV04",
      "releaseID": 12937141,
      "tracks": "12937141-A1,12937141-A2,12937141-B1,12937141-B2",
      "artist": "Dana Ruh, Molly (15)",
      "title": "4 Leaf Clover",
      "label": "RDV Music",
      "format": "12",
      "rating": 4,
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "diynamic music 045",
      "releaseID": 2641898,
      "tracks": "",
      "artist": "David August",
      "title": "Peace Of Conscience EP",
      "label": "Diynamic Music",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2011,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MOTHER036/037",
      "releaseID": 11363213,
      "tracks": "11363213-A1,11363213-A2,11363213-B1,11363213-B2",
      "artist": "David Ordonez, Superlover",
      "title": "The Spell Ep / Love Flute Ep",
      "label": "Mother (3)",
      "format": "12, EP, RE",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT001",
      "releaseID": 3675247,
      "tracks": "",
      "artist": "Deep & Disco",
      "title": "Deep & Disco Edits",
      "label": "Razor N Tape",
      "format": "12, W/Lbl, Sta",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MM141R",
      "releaseID": 1432417,
      "tracks": "",
      "artist": "Deetron Feat. Justin Chapman",
      "title": "Let's Get Over It Remix",
      "label": "Music Man Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2008,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MM166",
      "releaseID": 4532050,
      "tracks": "",
      "artist": "Deetron Feat. Ovasoul7",
      "title": "Out Of My Head",
      "label": "Music Man Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TOYE001",
      "releaseID": 14355507,
      "tracks": "",
      "artist": "Delfonic & Kapote",
      "title": "Illegal Jazz Vol. 1",
      "label": "Toy Toye Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SULTASELECTS 1",
      "releaseID": 9775208,
      "tracks": "",
      "artist": "Denis Sulta",
      "title": "Nein Fortiate EP",
      "label": "Sulta Selects",
      "format": "12",
      "rating": 5,
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BSC 012",
      "releaseID": 1139349,
      "tracks": "",
      "artist": "Dennis Ferrer",
      "title": "Funu",
      "label": "Basic Recordings",
      "format": "12, Promo",
      "rating": "",
      "releasedYear": 2001,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SLX-0, FRE-SEPAB",
      "releaseID": 15697437,
      "tracks": "",
      "artist": "Dinosaur L / Hanson & Davis",
      "title": "Go Bang! / I'll Take You On",
      "label": "Sleeping Bag Records, Fresh Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ML 2202, RI-93296",
      "releaseID": 3898709,
      "tracks": "",
      "artist": "Disco-D",
      "title": "Dance Tracs",
      "label": "Alleviated Records, Alleviated Records",
      "format": "12, RE, RM",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DB063",
      "releaseID": 3336887,
      "tracks": "",
      "artist": "DJ Cra$Y",
      "title": "(Breach Remixes)",
      "label": "dirtybird",
      "format": "12",
      "rating": "",
      "releasedYear": 2011,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "OYEEDIT008",
      "releaseID": 12417376,
      "tracks": "",
      "artist": "DJ Gene (2)",
      "title": "G-Spot Edits",
      "label": "Oye Edits",
      "format": "12, Ltd, Promo, Pur",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FILE UNDER DISCO #10",
      "releaseID": 5140613,
      "tracks": "",
      "artist": "DJ Rocca",
      "title": "Love Power",
      "label": "File Under Disco",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GR 1205",
      "releaseID": 8285974,
      "tracks": "",
      "artist": "Don Carlos",
      "title": "Alone",
      "label": "Calypso Records, Groovin Recordings",
      "format": "12, RE",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SPZ-012",
      "releaseID": 15054799,
      "tracks": "",
      "artist": "Don Ray",
      "title": "Body And Soul",
      "label": "Spaziale Recordings",
      "format": "12, Maxi, Unofficial",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DD28",
      "releaseID": 4481975,
      "tracks": "",
      "artist": "Donna Summer / Bob James",
      "title": "French Affair / Sfunky",
      "label": "Disco Deviance",
      "format": "12, Promo, Unofficial",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RENN3051",
      "releaseID": 26279,
      "tracks": "",
      "artist": "Dub Marines",
      "title": "Cayo La Luna / Blowin' Underground",
      "label": "Thursday Club Recordings (TCR)",
      "format": "12",
      "rating": "",
      "releasedYear": 2001,
      "genre": "Uncategorized"
    },
  ],
  E : [
    {
      "catalogID": "Editdub8",
      "releaseID": 11227281,
      "tracks": "",
      "artist": "Edit & Dub",
      "title": "Tee Scott Unreleased V3",
      "label": "Edit & Dub Record Tokyo Ltd.",
      "format": "12, S/Sided, Ltd",
      "rating": "",
      "releasedYear": 0,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT045",
      "releaseID": 13312308,
      "tracks": "",
      "artist": "Em Vee",
      "title": "Em Vee Edits",
      "label": "Razor N Tape",
      "format": "12, 180",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FUSE041",
      "releaseID": 14919909,
      "tracks": "",
      "artist": "Enzo Siragusa",
      "title": "The Lost Dubs EP",
      "label": "Fuse London",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SOURT066",
      "releaseID": 100756,
      "tracks": "",
      "artist": "Erlend Øye",
      "title": "Sudden Rush",
      "label": "Source",
      "format": "12",
      "rating": "",
      "releasedYear": 2003,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RH-STORE JAMS 014",
      "releaseID": 15003563,
      "tracks": "",
      "artist": "ESA & HIS AFRO-SYNTH BAND",
      "title": "Jack's Jive",
      "label": "Rush Hour (4)",
      "format": "12, W/Lbl",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
  ],
  F : [
    {
      "catalogID": "FBR039",
      "releaseID": 7867675,
      "tracks": "",
      "artist": "Felix Dickinson Feat. Robert Owens",
      "title": "A Day's Reality",
      "label": "Futureboogie Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MFAS02",
      "releaseID": 3194096,
      "tracks": "",
      "artist": "Fingers Inc.",
      "title": "Music Take Me Up / Feelin' Sleazy",
      "label": "Jack Trax (2)",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2011,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HOD008",
      "releaseID": 4578823,
      "tracks": "",
      "artist": "Finnebassen",
      "title": "Baby",
      "label": "House Of Disco Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DD29",
      "releaseID": 4629823,
      "tracks": "",
      "artist": "Five Special / Fad Gadget",
      "title": "Might Even Dance / Love Itch",
      "label": "Disco Deviance",
      "format": "12, Promo, Unofficial",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "slomo020",
      "releaseID": 7474320,
      "tracks": "",
      "artist": "Francisco",
      "title": "Lineabeat Vol. 2",
      "label": "Slow Motion Records (2)",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "slomo040",
      "releaseID": 12248092,
      "tracks": "",
      "artist": "Francisco & Cosmo (39)",
      "title": "Lineabeat Vol. 5",
      "label": "Slow Motion Records (2)",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "REB051",
      "releaseID": 2654478,
      "tracks": "",
      "artist": "Freaks & 012",
      "title": "Conscious Of My Conscience",
      "label": "Rebirth",
      "format": "12",
      "rating": "",
      "releasedYear": 2011,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "600 902, 600 902-213",
      "releaseID": 99389,
      "tracks": "",
      "artist": "Freeez",
      "title": "I.O.U. (Megamix)",
      "label": "Virgin, Virgin, Beggars Banquet, Beggars Banquet",
      "format": "12",
      "rating": "",
      "releasedYear": 1983,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HEIST014",
      "releaseID": 8003509,
      "tracks": "",
      "artist": "Frits Wentink",
      "title": "Rising Sun, Falling Coconut EP",
      "label": "Heist (2)",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
  ],
  G : [
    {
      "catalogID": "SD 16042",
      "releaseID": 227605,
      "tracks": "",
      "artist": "Gino Soccio",
      "title": "Closer",
      "label": "Atlantic, RFC Records",
      "format": "LP, Album, SP",
      "rating": "",
      "releasedYear": 1981,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LIH 034",
      "releaseID": 13172075,
      "tracks": "",
      "artist": "Giovanni Damico",
      "title": "The Sounds Of Revolution EP",
      "label": "Lumberjacks In Hell",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "XEXPAND 1010",
      "releaseID": 3636517,
      "tracks": "",
      "artist": "Gregory Porter",
      "title": "1960 What?",
      "label": "Expansion",
      "format": "12, RE",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CRM067",
      "releaseID": 2559033,
      "tracks": "2559033-A,2559033-AA",
      "artist": "Guti & Dubshape",
      "title": "Every Cow Has A Bird / Bueno",
      "label": "Crosstown Rebels",
      "format": "12",
      "rating": "",
      "releasedYear": 2010,
      "genre": "Uncategorized"
    },
  ],
  H : [
    {
      "catalogID": "SPZ-011",
      "releaseID": 15029003,
      "tracks": "",
      "artist": "Hamilton Bohannon",
      "title": "Me And The Gang / Let's Start The Dance",
      "label": "Spaziale Recordings",
      "format": "12, RM, Unofficial",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RB071",
      "releaseID": 12703743,
      "tracks": "",
      "artist": "Helium Robots",
      "title": "Bleep",
      "label": "Running Back",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SSX12002b",
      "releaseID": 1542905,
      "tracks": "",
      "artist": "Holy Ghost Inc. / Afefe Iku",
      "title": "Secretsundaze Volume 2 Album Sampler B",
      "label": "Secretsundaze",
      "format": "12, Smplr",
      "rating": "",
      "releasedYear": 2008,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "AB001",
      "releaseID": 4533528,
      "tracks": "",
      "artist": "Hoxx",
      "title": "Off Beat",
      "label": "Ascending Branch",
      "format": "12, Ltd",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "REGRD002",
      "releaseID": 7803538,
      "tracks": "",
      "artist": "Hubie Davison",
      "title": "Sanctified",
      "label": "Regraded",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "PP-UTI-07",
      "releaseID": 8325698,
      "tracks": "",
      "artist": "Hysteric",
      "title": "Mappamondo",
      "label": "Public Possession",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
  ],
  I : [
    {
      "catalogID": "HVNLP 01",
      "releaseID": 7475743,
      "tracks": "",
      "artist": "INIT (5)",
      "title": "Two Pole Resonance",
      "label": "Hivern Discs",
      "format": "2xLP, Album",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
  ],
  J : [
    {
      "catalogID": "JACK008-PT1",
      "releaseID": 4941623,
      "tracks": "",
      "artist": "Jackmode",
      "title": "5 Years Of Jackmode Part 1",
      "label": "Jackmode Music",
      "format": "12, Blu",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT029",
      "releaseID": 10775213,
      "tracks": "",
      "artist": "Jacques Renault",
      "title": "Jacques Renault Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GAMM111",
      "releaseID": 10462896,
      "tracks": "",
      "artist": "Jamie 3:26",
      "title": "Blessin'",
      "label": "G.A.M.M.",
      "format": "12, Promo",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SE 007, SE-007",
      "releaseID": 7825183,
      "tracks": "",
      "artist": "Javi Frías",
      "title": "Disco Edits Vol. 1",
      "label": "Street Edits, Street Edits",
      "format": "12, Promo, 180",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GC007",
      "releaseID": 8380487,
      "tracks": "",
      "artist": "Javi Frías",
      "title": "Discotizer EP",
      "label": "Giant Cuts",
      "format": "12, Ltd",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "NSR 001",
      "releaseID": 9988027,
      "tracks": "",
      "artist": "Javi Frías",
      "title": "Make It Happen Ep",
      "label": "Night Shift Records (4)",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "NSR004",
      "releaseID": 12967867,
      "tracks": "12967867-A,12967867-B",
      "artist": "Javi Frías",
      "title": "Just Give It Up",
      "label": "Night Shift Records (4)",
      "format": "12",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HITOP 016 CD",
      "releaseID": 947721,
      "tracks": "",
      "artist": "Javi P3z Orquesta",
      "title": "Sports",
      "label": "HiTop Records",
      "format": "CD, Album",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "STILLMDLP006, Stillmlp006",
      "releaseID": 3807499,
      "tracks": "",
      "artist": "Jerome Derradji",
      "title": "122 BPM (The Birth Of House Music)",
      "label": "Still Music, Still Music",
      "format": "2xLP, Comp",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TKD-13067",
      "releaseID": 9494679,
      "tracks": "",
      "artist": "Jo Bisso / Amant",
      "title": "Love Somebody (Danny Krivit Edit) / Hazy Shades Of Love (Danny Krivit Edit)",
      "label": "T.K. Disco",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KOPR45-001",
      "releaseID": 17653534,
      "tracks": "17653534-A,17653534-B",
      "artist": "Joãozinho Morgado",
      "title": "Turma da Bênção",
      "label": "Keep On Pushin Records",
      "format": "7",
      "rating": "",
      "releasedYear": 2021,
      "genre": "World,House"
    },
    {
      "catalogID": "GR 1219",
      "releaseID": 10514560,
      "tracks": "",
      "artist": "Joe Lewis",
      "title": "Survival EP 2",
      "label": "Groovin Recordings",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": 94,
      "releaseID": 48365,
      "tracks": "",
      "artist": "Joe Thomas",
      "title": "Plato's Retreat / A Place In Space",
      "label": "T.K. Disco",
      "format": "12",
      "rating": "",
      "releasedYear": 1978,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JELX 2",
      "releaseID": 440386,
      "tracks": "",
      "artist": "John Jellybean Benitez",
      "title": "Jingo (The Definitive Mixes)",
      "label": "Chrysalis",
      "format": "12, Single",
      "rating": "",
      "releasedYear": 1987,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "OYEEDIT002",
      "releaseID": 9445068,
      "tracks": "9445068-A1,9445068-A2,9445068-B1,9445068-B2",
      "artist": "Jonny Rock",
      "title": "OYE Edits 02",
      "label": "Oye Edits",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RHM 029",
      "releaseID": 12918722,
      "tracks": "",
      "artist": "Jordan GCZ",
      "title": "Pinball Lizard",
      "label": "Rush Hour (4)",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ND 004",
      "releaseID": 13483163,
      "tracks": "13483163-A,13483163-B",
      "artist": "Jungle By Night",
      "title": "Livingstone Remixes",
      "label": "New Dawn (6)",
      "format": "12",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
  ],
  K : [
    {
      "catalogID": "TOYT091",
      "releaseID": 14123818,
      "tracks": "14123818-A1,14123818-A2,14123818-B1,14123818-B2",
      "artist": "Kapote",
      "title": "Remix EP 2",
      "label": "Toy Tonics",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "lih021",
      "releaseID": 9973393,
      "tracks": "",
      "artist": "Karizma & Marcel Vogel",
      "title": "The Deadpool EP",
      "label": "Lumberjacks In Hell",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DIYNAMIC 061",
      "releaseID": 4250280,
      "tracks": "",
      "artist": "Karmon",
      "title": "Feel It Ep",
      "label": "Diynamic Music",
      "format": "12",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "32, TKDISCORSD2015PT1",
      "releaseID": 6911646,
      "tracks": "",
      "artist": "KC & The Sunshine Band",
      "title": "I Get Lifted",
      "label": "T.K. Disco, T.K. Disco",
      "format": "10, Ltd, Yel",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TEXT 048",
      "releaseID": 13483432,
      "tracks": "13483432-A",
      "artist": "Kieran Hebden",
      "title": "Only Human",
      "label": "Text Records",
      "format": "12, S/Sided",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SNDWLP047",
      "releaseID": 4080563,
      "tracks": "",
      "artist": "Kiki Gyan",
      "title": "24 Hours In A Disco 1978-82",
      "label": "Soundway",
      "format": "2xLP, Comp",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HHYR12",
      "releaseID": 2516009,
      "tracks": "2516009-A,2516009-B",
      "artist": "KiNK & Neville Watson",
      "title": "Metropole",
      "label": "Hour House Is Your Rush Records",
      "format": "12",
      "rating": 5,
      "releasedYear": 2010,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RBFRONTLP1",
      "releaseID": 12595653,
      "tracks": "",
      "artist": "Klaus Stockhausen & Boris Dlugosch",
      "title": "Running Back Mastermix Presents - Front / Part 1 (Proto House & Disco)",
      "label": "Running Back",
      "format": "2x12, Comp",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DMD 609",
      "releaseID": 4107471,
      "tracks": "",
      "artist": "Klein & M.B.O.",
      "title": "The MBO Theme / Wonderful",
      "label": "Atlantic (2)",
      "format": "12, Promo, Unofficial",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "50999 9 66052 1 9, STUMM 309",
      "releaseID": 2058319,
      "tracks": "",
      "artist": "Kraftwerk",
      "title": "The Mix",
      "label": "Kling Klang, Mute",
      "format": "2xLP, Album, RE, RM",
      "rating": "",
      "releasedYear": 2009,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "mule musiq 160",
      "releaseID": 4598694,
      "tracks": "4598694-A,4598694-B",
      "artist": "Kuniyuki Takahashi Feat. Henrik Schwarz",
      "title": "The Session 2",
      "label": "Mule Musiq",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
  ],
  L : [
    {
      "catalogID": "PN01",
      "releaseID": 12960814,
      "tracks": "",
      "artist": "La Compagnie Créole",
      "title": "A.I.É (Larry Levan Unreleased Remixes)",
      "label": "Pardonnez-nous",
      "format": "12, RM",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "F055",
      "releaseID": 8926894,
      "tracks": "",
      "artist": "Laurent Garnier",
      "title": "Crispy Bacon (Jeff Mills Remix)",
      "label": "F Communications",
      "format": "12, Ltd, RE",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "AA 1073, AA-1073",
      "releaseID": 478786,
      "tracks": "",
      "artist": "Lenny Williams",
      "title": "Spark Of Love",
      "label": "ABC Records, ABC Records",
      "format": "LP, Album",
      "rating": "",
      "releasedYear": 1978,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TX158",
      "releaseID": 32107,
      "tracks": "",
      "artist": "Lidell Townsell",
      "title": "Get The Hole",
      "label": "Trax Records",
      "format": "12",
      "rating": "",
      "releasedYear": 1988,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RH RSS 28",
      "releaseID": 15166453,
      "tracks": "",
      "artist": "Linda 'Babe' Majika, Thoughts Visions And Dreams Featuring Ray Phiri",
      "title": "Let's Make a Deal",
      "label": "Rush Hour (4)",
      "format": "12, W/Lbl",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "STS18312",
      "releaseID": 2178265,
      "tracks": "2178265-A,2178265-B",
      "artist": "Lindstrøm and Christabelle",
      "title": "Baby Can't Stop",
      "label": "Smalltown Supersound",
      "format": "12",
      "rating": "",
      "releasedYear": 2010,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SV090",
      "releaseID": 7360061,
      "tracks": "",
      "artist": "Liquid Liquid",
      "title": "Optimo",
      "label": "Superior Viaduct",
      "format": "12, EP, RE",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
  ],
  M : [
    {
      "catalogID": "PF99",
      "releaseID": 12263265,
      "tracks": "",
      "artist": "Madlaks, Hot Slot Machine",
      "title": "Dance Forever Young Marco Reworks",
      "label": "Safe Trip",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FVR121",
      "releaseID": 8422392,
      "tracks": "",
      "artist": "Magic Source",
      "title": "Lovestruck EP",
      "label": "Favorite Recordings",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LPP005",
      "releaseID": 4750578,
      "tracks": "4750578-A,4750578-B",
      "artist": "Marcus Mixx",
      "title": "M+M Theme",
      "label": "Let's Pet Puppies",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GUDU003",
      "releaseID": 14914454,
      "tracks": "14914454-A,14914454-B1,14914454-B2",
      "artist": "Maurice Fulton Ft. Peggy Gou",
      "title": "Earth EP",
      "label": "Gudu Records",
      "format": "12, EP",
      "rating": 5,
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ST 008",
      "releaseID": 11727197,
      "tracks": "",
      "artist": "Max Abysmal",
      "title": "Sutekh's Mirage / Donna, Don't Stop",
      "label": "Safe Trip",
      "format": "12, Single",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "25653-1, 9 25653-1, 1-25653",
      "releaseID": 1348454,
      "tracks": "",
      "artist": "Michael Cooper",
      "title": "Love Is Such A Funny Game",
      "label": "Warner Bros. Records, Warner Bros. Records, Warner Bros. Records",
      "format": "LP, Album",
      "rating": "",
      "releasedYear": 1987,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "REGRD003",
      "releaseID": 8593295,
      "tracks": "",
      "artist": "Midland",
      "title": "Final Credits",
      "label": "Regraded",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "611 014",
      "releaseID": 360947,
      "tracks": "",
      "artist": "Milli Vanilli",
      "title": "Girl You Know It's True",
      "label": "Hansa",
      "format": "12, Maxi",
      "rating": "",
      "releasedYear": 1988,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT017",
      "releaseID": 8628680,
      "tracks": "",
      "artist": "Misiu (3)",
      "title": "Misiu Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "M-002",
      "releaseID": 1078015,
      "tracks": "",
      "artist": "Model 500",
      "title": "Night Drive (Thru-Babylon)",
      "label": "Metroplex",
      "format": "12, RP",
      "rating": "",
      "releasedYear": 0,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MXMRK-2038",
      "releaseID": 16845729,
      "tracks": "16845729-A,16845729-B",
      "artist": "Mr. K",
      "title": "The Mr K Edits",
      "label": "Most Excellent Unlimited",
      "format": "12",
      "rating": "",
      "releasedYear": 2021,
      "genre": "Disco"
    },
    {
      "catalogID": "DSR016",
      "releaseID": 11510783,
      "tracks": "",
      "artist": "Mr. K / Joeseph Madonia",
      "title": "Give It Up / Please Come Home",
      "label": "Dailysession Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "OYEEDIT 013",
      "releaseID": 14355483,
      "tracks": "",
      "artist": "Mudegg",
      "title": "Oye Edits 013",
      "label": "Oye Edits",
      "format": "12, Unofficial, dar",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "PIASB365LP",
      "releaseID": 5613852,
      "tracks": "",
      "artist": "My Little Cheap Dictaphone",
      "title": "The Smoke Behind The Sound",
      "label": "[PIAS] Recordings",
      "format": "LP, Album + CD, Album",
      "rating": "",
      "releasedYear": 2014,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "YSD74",
      "releaseID": 7273478,
      "tracks": "",
      "artist": "Myles Bigelow",
      "title": "Turning Pages",
      "label": "Yoruba Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "House"
    },
  ],
  N : [
    {
      "catalogID": "C#CC32",
      "releaseID": 11172441,
      "tracks": "",
      "artist": "Neal Howard",
      "title": "To Be Or Not To Be",
      "label": "Clone Classic Cuts",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNTR017",
      "releaseID": 10052747,
      "tracks": "",
      "artist": "Nebraska",
      "title": "Drill Deep EP",
      "label": "Razor N Tape Reserve",
      "format": "12, EP, Yel",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HFT024",
      "releaseID": 3862124,
      "tracks": "",
      "artist": "NeferTT",
      "title": "Blue Skies Red Soil EP",
      "label": "Hotflush Recordings",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CCS055-2",
      "releaseID": 3380043,
      "tracks": "",
      "artist": "Nicolas Jaar",
      "title": "Space Is Only Noise",
      "label": "Circus Company",
      "format": "LP, Album, RE",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SVT 091",
      "releaseID": 4052739,
      "tracks": "",
      "artist": "Niconé & Sascha Braemer",
      "title": "United Colors Of Language",
      "label": "Stil Vor Talent",
      "format": "12",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ERATP055LP",
      "releaseID": 5080134,
      "tracks": "",
      "artist": "Nils Frahm",
      "title": "Spaces",
      "label": "Erased Tapes Records",
      "format": "2xLP, Album, Ltd",
      "rating": "",
      "releasedYear": 2014,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KLING078",
      "releaseID": 4747353,
      "tracks": "",
      "artist": "Ninetoes",
      "title": "Finder",
      "label": "Kling Klong",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GARM01",
      "releaseID": 14868430,
      "tracks": "",
      "artist": "Ntel",
      "title": "Dilution Effect",
      "label": "Garmo",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BAR25-19",
      "releaseID": 15092783,
      "tracks": "",
      "artist": "Nu (5)",
      "title": "We Love The Sun",
      "label": "BAR25",
      "format": "12, RP, Yel",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
  ],
  O : [
    {
      "catalogID": "DIAL 013",
      "releaseID": 936257,
      "tracks": "936257-A,936257-AA",
      "artist": "Ost & Kjex",
      "title": "Milano Model",
      "label": "Dialect Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2007,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FBR033",
      "releaseID": 7202358,
      "tracks": "",
      "artist": "Outboxx",
      "title": "Under the Lights EP",
      "label": "Futureboogie Recordings",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
  ],
  P : [
    {
      "catalogID": "6328 109 A",
      "releaseID": 4450917,
      "tracks": "",
      "artist": "Paco De Lucía",
      "title": "Fuente Y Caudal",
      "label": "Philips",
      "format": "LP",
      "rating": "",
      "releasedYear": 1975,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "QD05",
      "releaseID": 13783391,
      "tracks": "",
      "artist": "Papa Wemba / Oumou Sangare",
      "title": "Afro Vibes EP",
      "label": "Queen & Disco",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DEMO007",
      "releaseID": 4657955,
      "tracks": "4657955-A1,4657955-B1,4657955-B2",
      "artist": "Parris Mitchell",
      "title": "Juke Joints Remixes Vol. One",
      "label": "Deep Moves",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "M-1004",
      "releaseID": 20039,
      "tracks": "",
      "artist": "Patrick Cowley",
      "title": "Mind Warp",
      "label": "Megatone Records",
      "format": "LP, Album",
      "rating": "",
      "releasedYear": 1982,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT035",
      "releaseID": 11850350,
      "tracks": "",
      "artist": "Patrick Gibin aka Twice",
      "title": "Patrick Gibin aka Twice Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GUDU001",
      "releaseID": 13511051,
      "tracks": "",
      "artist": "Peggy Gou",
      "title": "Moment EP",
      "label": "Gudu Records",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT032",
      "releaseID": 11209880,
      "tracks": "",
      "artist": "Peter Croce",
      "title": "Peter Croce Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FINGER029",
      "releaseID": 10522663,
      "tracks": "",
      "artist": "Philou Louzolo",
      "title": "Bambouk Tributes",
      "label": "Basic Fingers",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Dessous 71, DES71",
      "releaseID": 1430221,
      "tracks": "",
      "artist": "Phonique",
      "title": "Casualities",
      "label": "Dessous Recordings, Dessous Recordings",
      "format": "12, Promo, W/Lbl, Sti",
      "rating": "",
      "releasedYear": 2007,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RR002",
      "releaseID": 15049197,
      "tracks": "",
      "artist": "Pierre Tchana",
      "title": "Super Disco",
      "label": "Royer Records (2)",
      "format": "12, Ltd, RE",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Klakson 12",
      "releaseID": 570467,
      "tracks": "570467-A1,570467-A2,570467-B1,570467-B2",
      "artist": "Putsch '79",
      "title": "Winterslam",
      "label": "Klakson",
      "format": "12",
      "rating": "",
      "releasedYear": 2005,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "C#34-lp",
      "releaseID": 1149377,
      "tracks": "1149377-A1,1149377-A2,1149377-B1,1149377-B2,1149377-C1,1149377-C2,1149377-D1,1149377-D2",
      "artist": "Putsch '79",
      "title": "Putsch",
      "label": "Clone",
      "format": "2x12, Album, Ltd, Gre",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
  ],
  R : [
    {
      "catalogID": "KAT 010",
      "releaseID": 2703325,
      "tracks": "",
      "artist": "Rahaan",
      "title": "Edits Vol 3",
      "label": "KAT",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2011,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "lih025",
      "releaseID": 10952535,
      "tracks": "10952535-A1,10952535-B1,10952535-B2",
      "artist": "Rahaan",
      "title": "Grapes",
      "label": "Lumberjacks In Hell",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KM032",
      "releaseID": 8601088,
      "tracks": "8601088-A1,8601088-A2,8601088-B1,8601088-B2",
      "artist": "Rampa",
      "title": "Trust",
      "label": "Keinemusik",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "WES 5004",
      "releaseID": 4933,
      "tracks": "",
      "artist": "Raw Silk",
      "title": "Do It To The Music",
      "label": "West End Records",
      "format": "12, RM",
      "rating": "",
      "releasedYear": 2000,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SG 382 DJ",
      "releaseID": 223283,
      "tracks": "",
      "artist": "Rayy Slyy",
      "title": "Hey You (You Got To Give It Up)",
      "label": "Salsoul Records",
      "format": "12, Promo",
      "rating": "",
      "releasedYear": 1982,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "K7371EP",
      "releaseID": 12298184,
      "tracks": "12298184-A,12298184-B1,12298184-B2",
      "artist": "Red Axes",
      "title": "Trips #1: In Africa EP",
      "label": "!K7 Records",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BERG 005",
      "releaseID": 8204601,
      "tracks": "",
      "artist": "Red Rack'em",
      "title": "Wonky Bassline Disco Banger",
      "label": "Bergerac",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "BAN001",
      "releaseID": 13140455,
      "tracks": "",
      "artist": "René Zogo",
      "title": "Africa",
      "label": "Banquise Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ROAS01",
      "releaseID": 1334232,
      "tracks": "",
      "artist": "Robert Owens",
      "title": "Untitled",
      "label": "Jack Trax (2)",
      "format": "2x12, Comp, Unofficial",
      "rating": "",
      "releasedYear": 2008,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TASTE OF HONEY 005",
      "releaseID": 4103239,
      "tracks": "",
      "artist": "Robot Needs Oil",
      "title": "Traveller",
      "label": "Taste Of Honey",
      "format": "12, S/Sided, W/Lbl",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "G-Stone 12 028",
      "releaseID": 257615,
      "tracks": "",
      "artist": "Rodney Hunter",
      "title": "Electric Lady",
      "label": "G-Stone Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "12 028",
      "releaseID": 13012204,
      "tracks": "",
      "artist": "Rodney Hunter",
      "title": "Electric Lady",
      "label": "G-Stone Recordings",
      "format": "12, Maxi, Promo, W/Lbl",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RB088",
      "releaseID": 14856963,
      "tracks": "14856963-A1,14856963-A2,14856963-B1,14856963-B2",
      "artist": "Roman Flügel",
      "title": "Garden Party",
      "label": "Running Back",
      "format": "12",
      "rating": 5,
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT024",
      "releaseID": 9868992,
      "tracks": "",
      "artist": "Ron Bacardi (2)",
      "title": "Ron Bacardi Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RR0029 EP",
      "releaseID": 231126,
      "tracks": "",
      "artist": "Roy Ayers",
      "title": "Baby Doll",
      "label": "Rapster Records, BBE",
      "format": "12",
      "rating": "",
      "releasedYear": 2003,
      "genre": "Uncategorized"
    },
  ],
  S : [
    {
      "catalogID": "DWT70366",
      "releaseID": 5502834,
      "tracks": "",
      "artist": "San Fermin",
      "title": "San Fermin",
      "label": "Downtown",
      "format": "LP, Album + CD",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "AFRO 001",
      "releaseID": 14793207,
      "tracks": "",
      "artist": "Sean Alvarez",
      "title": "Genesis",
      "label": "Afrofuturistic",
      "format": "12, S/Sided",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SE-008",
      "releaseID": 8080705,
      "tracks": "",
      "artist": "Serge Gamesbourg",
      "title": "Rework Edition Pt. 2",
      "label": "Street Edits",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FA014",
      "releaseID": 1756386,
      "tracks": "1756386-A,1756386-B",
      "artist": "Sheharzad / Jens Lodén",
      "title": "Yalla Yalla / First One",
      "label": "Fine Art Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2009,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Lita 089",
      "releaseID": 4075655,
      "tracks": "",
      "artist": "Sixto Rodriguez",
      "title": "Searching For Sugar Man - Original Motion Picture Soundtrack",
      "label": "Light In The Attic, Legacy",
      "format": "2xLP, Comp, RM",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SG 371",
      "releaseID": 993147,
      "tracks": "",
      "artist": "Sly Cabell",
      "title": "Feelin' Fine",
      "label": "Salsoul Records",
      "format": "12",
      "rating": "",
      "releasedYear": 1982,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MCM 002",
      "releaseID": 11012952,
      "tracks": "",
      "artist": "Smashed Atoms",
      "title": "Cut This Way",
      "label": "Magic Circles Music",
      "format": "12, Promo",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TA003",
      "releaseID": 10240459,
      "tracks": "",
      "artist": "Soul Reductions",
      "title": "Got 2 Be Loved",
      "label": "Take Away (3)",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SST 06",
      "releaseID": 4105359,
      "tracks": "",
      "artist": "Sound Stream",
      "title": "Julie's Theme",
      "label": "Sound Stream",
      "format": "12",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MET H 022",
      "releaseID": 5558,
      "tracks": "",
      "artist": "Source Direct",
      "title": "Stonekiller / Web Of Sin",
      "label": "Metalheadz",
      "format": "12",
      "rating": "",
      "releasedYear": 1996,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TD001",
      "releaseID": 13443739,
      "tracks": "",
      "artist": "Steel Mind",
      "title": "Boss Man | Lionel",
      "label": "Tempo Dischi",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "A7E001",
      "releaseID": 12727148,
      "tracks": "12727148-A1,12727148-A2,12727148-A3,12727148-A4",
      "artist": "Stefano Ritteri",
      "title": "A7 Edits Volume 1",
      "label": "A7 Edits",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "Domeright",
      "releaseID": 2574574,
      "tracks": "2574574-A,2574574-B1,2574574-B2,2574574-B3",
      "artist": "Steffi",
      "title": "Yours",
      "label": "Domeright ‎",
      "format": "12",
      "rating": "",
      "releasedYear": 2010,
      "genre": "House"
    },
    {
      "catalogID": "PFR44",
      "releaseID": 255414,
      "tracks": "255414-A,255414-B1,255414-B2",
      "artist": "Steve Bug",
      "title": "Future Retro 101",
      "label": "Poker Flat Recordings",
      "format": "12",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "UB003",
      "releaseID": 178127,
      "tracks": "",
      "artist": "Street Technique",
      "title": "Down / Electra Groove",
      "label": "Ultimatum Breaks",
      "format": "12",
      "rating": "",
      "releasedYear": 1998,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LEMALBUM01",
      "releaseID": 11229452,
      "tracks": "",
      "artist": "Sue Avenue's Studio 58",
      "title": "Live At Expo '58",
      "label": "Lemonade",
      "format": "LP + 7",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RNT019",
      "releaseID": 8744061,
      "tracks": "",
      "artist": "Superprince",
      "title": "Superprince Edits",
      "label": "Razor N Tape",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
  ],
  T : [
    {
      "catalogID": "TKD13061",
      "releaseID": 7829477,
      "tracks": "",
      "artist": "T-Connection / Jimmy McGriff",
      "title": "Do What You Wanna Do / Tailgunner",
      "label": "T.K. Disco",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TRI004",
      "releaseID": 8191916,
      "tracks": "",
      "artist": "Tee Mango",
      "title": "Tribute #4",
      "label": "Millionhands Black",
      "format": "12, EP, Ltd",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DE-130",
      "releaseID": 8893557,
      "tracks": "",
      "artist": "The Pool",
      "title": "Dance It Down / Jamaica Running",
      "label": "Dark Entries",
      "format": "12, RE, RM",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RGRV001",
      "releaseID": 4723399,
      "tracks": "4723399-A1,4723399-A2,4723399-B1,4723399-B2",
      "artist": "The Revenge (2)",
      "title": "Body Fusion EP",
      "label": "Roar Groove",
      "format": "12, EP, Ltd",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "WD65",
      "releaseID": 13643267,
      "tracks": "",
      "artist": "The Silver Rider / The Funk District",
      "title": "Fake News EP",
      "label": "Whiskey Disco",
      "format": "12, EP, Promo",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KITSUNÉ 013",
      "releaseID": 300121,
      "tracks": "",
      "artist": "The Whitest Boy Alive / Cosmo Vitelli",
      "title": "Inflation  /  Dance With Me",
      "label": "Kitsuné Music",
      "format": "10",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KOIJAYE",
      "releaseID": 14050457,
      "tracks": "",
      "artist": "Tjade",
      "title": "Koi Jaye (Edit)",
      "label": "Bordello A Parigi",
      "format": "12, S/Sided",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RH-STORE JAMS 013",
      "releaseID": 14870039,
      "tracks": "",
      "artist": "Tom Noble (3)",
      "title": "Flashlight",
      "label": "Rush Hour Store Jams",
      "format": "12",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ST014x",
      "releaseID": 14040164,
      "tracks": "",
      "artist": "Trans-4M",
      "title": "Arrival / Amma",
      "label": "Safe Trip",
      "format": "12, Maxi",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JEUDI005V",
      "releaseID": 4336873,
      "tracks": "",
      "artist": "Turntablerocker",
      "title": "Grow Up EP",
      "label": "JEUDI Records",
      "format": "12, Whi",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
  ],
  U : [
    {
      "catalogID": "MR2003",
      "releaseID": 7183442,
      "tracks": "",
      "artist": "Unknown Artist",
      "title": "My Rules #3",
      "label": "My Rules",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GALL011",
      "releaseID": 14503829,
      "tracks": "",
      "artist": "Unknown Artist",
      "title": "Honky Get Fonky / Bu Bu Yam Yam",
      "label": "Bitter End Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TJE-003",
      "releaseID": 13501711,
      "tracks": "",
      "artist": "Unknown Artist",
      "title": "Tropical Jam 3",
      "label": "Tropical Jam",
      "format": "10, Unofficial, W/Lbl, Han",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "OTE004",
      "releaseID": 11463219,
      "tracks": "",
      "artist": "Unknown Artist",
      "title": "Eastern Edits Vol. 1",
      "label": "Orange Tree Edits",
      "format": "12, W/Lbl, Sta",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
  ],
  V : [
    {
      "catalogID": "RDY 33",
      "releaseID": 9148337,
      "tracks": "",
      "artist": "Various",
      "title": "Ron Hardy #33",
      "label": "Not On Label (Ron Hardy)",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GRIME 003",
      "releaseID": 2529453,
      "tracks": "",
      "artist": "Various",
      "title": "Grimy Edits Vol. 3",
      "label": "Grimy Edits",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2010,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ST 003-2 LP",
      "releaseID": 9992673,
      "tracks": "9992673-A1,9992673-A2,9992673-A3,9992673-B1,9992673-B2,9992673-B3,9992673-C1,9992673-C2,9992673-D1,9992673-D2,9992673-D3",
      "artist": "Various",
      "title": "Welcome To Paradise Vol. II: Italian Dream House 89-93",
      "label": "Safe Trip",
      "format": "2xLP, Comp",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GRIME 005",
      "releaseID": 3770671,
      "tracks": "",
      "artist": "Various",
      "title": "Grimy Edits Vol. 5",
      "label": "Grimy Edits",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2012,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "GRIME 006",
      "releaseID": 4442802,
      "tracks": "",
      "artist": "Various",
      "title": "Grimy Edits Vol. 6",
      "label": "Grimy Edits",
      "format": "12, Unofficial, Red",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JACK008-PT4",
      "releaseID": 4719661,
      "tracks": "",
      "artist": "Various",
      "title": "5 Years Of Jackmode Part *4*",
      "label": "Jackmode Music",
      "format": "12, Blu",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SNDWLP087",
      "releaseID": 9425519,
      "tracks": "",
      "artist": "Various",
      "title": "Doing It In Lagos (Boogie, Pop & Disco In 1980s Nigeria)",
      "label": "Soundway",
      "format": "3xLP, Comp + 7, Comp",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CHBOXLP01",
      "releaseID": 168019,
      "tracks": "",
      "artist": "Various",
      "title": "Chicago House 86 - 91: The Definitive Story",
      "label": "Beechwood Music",
      "format": "4xLP, Comp",
      "rating": "",
      "releasedYear": 1997,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JACK008-PT2",
      "releaseID": 4839788,
      "tracks": "",
      "artist": "Various",
      "title": "5 Years Of Jackmode Part *2*",
      "label": "Jackmode Music",
      "format": "12, Gre",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HITOP010CD",
      "releaseID": 577144,
      "tracks": "",
      "artist": "Various",
      "title": "Watch TV Presents The After School Special 2",
      "label": "HiTop Records",
      "format": "CD, Comp",
      "rating": "",
      "releasedYear": 2003,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MAREH 002",
      "releaseID": 7160321,
      "tracks": "",
      "artist": "Various",
      "title": "Mareh Drops",
      "label": "Mareh Music",
      "format": "12",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "OTE005",
      "releaseID": 12477732,
      "tracks": "12477732-A\t,12477732-B",
      "artist": "Various",
      "title": "Afro Edits Vol. 4",
      "label": "Orange Tree Edits",
      "format": "12, W/Lbl, sta",
      "rating": 5,
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "WOF V04",
      "releaseID": 8645221,
      "tracks": "",
      "artist": "Various",
      "title": "Room Service",
      "label": "Wall Of Fame",
      "format": "12",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DISCOHAMAM 04",
      "releaseID": 12392897,
      "tracks": "",
      "artist": "Various",
      "title": "Disco Hamam - 4",
      "label": "Disco Hamam",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "CPT 439-1",
      "releaseID": 5238603,
      "tracks": "5238603-A1,5238603-A2,5238603-A3,5238603-B1,5238603-B2,5238603-C1,5238603-C2,5238603-D1,5238603-D2",
      "artist": "Various",
      "title": "Elaste Volume 04 - Meta-Disco And Proto-House",
      "label": "Compost Records",
      "format": "2xLP, Comp",
      "rating": "",
      "releasedYear": 2014,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "M12009",
      "releaseID": 11426414,
      "tracks": "",
      "artist": "Various",
      "title": "Dialogue Vol.3",
      "label": "Monologues Records",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LiH 039",
      "releaseID": 15993044,
      "tracks": "15993044-A1,15993044-A2,15993044-B1,15993044-B2,15993044-C1,15993044-C2,15993044-D1,15993044-D2",
      "artist": "Various",
      "title": "From Hell With Love 2",
      "label": "Lumberjacks In Hell",
      "format": "2x12, Comp",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DISCOHAMAM3",
      "releaseID": 11138834,
      "tracks": "",
      "artist": "Various",
      "title": "Disco Hamam - 3",
      "label": "Disco Hamam",
      "format": "12",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "JACK008-PT3",
      "releaseID": 4839816,
      "tracks": "",
      "artist": "Various",
      "title": "5 Years Of Jackmode Part *3*",
      "label": "Jackmode Music",
      "format": "12, Pin",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "RFBR004",
      "releaseID": 4662972,
      "tracks": "",
      "artist": "Various",
      "title": "S.H.A.G. Edits Volume Two",
      "label": "Roots For Bloom",
      "format": "12",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "LiH016",
      "releaseID": 7609468,
      "tracks": "",
      "artist": "Various",
      "title": "From Hell With Love - 5 Years Of Lumberjacks In Hell",
      "label": "Lumberjacks In Hell",
      "format": "2x12, Comp",
      "rating": "",
      "releasedYear": 2015,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "HITOP015CD",
      "releaseID": 2087678,
      "tracks": "",
      "artist": "Various",
      "title": "Spain Is Different",
      "label": "HiTop Records",
      "format": "CD, Comp",
      "rating": "",
      "releasedYear": 2004,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "WELCOMETOVICECITY01",
      "releaseID": 15333742,
      "tracks": "15333742-A0,15333742-A1,15333742-A2,15333742-B1,15333742-B2,15333742-C1,15333742-C2,15333742-C3,15333742-D1,15333742-D2,15333742-D3",
      "artist": "Various",
      "title": "Welcome To Vice City",
      "label": "Vice City",
      "format": "2x12, Comp",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "SRCLASSICS08LP",
      "releaseID": 14813928,
      "tracks": "",
      "artist": "Various",
      "title": "30 Years Of Strictly Rhythm Part Three",
      "label": "Strictly Rhythm",
      "format": "2x12, Comp",
      "rating": "",
      "releasedYear": 2020,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "ASVN040",
      "releaseID": 11189034,
      "tracks": "",
      "artist": "Various",
      "title": "Africa Airways Four (Disco Funk Touchdown 1976-1983)",
      "label": "Africa Seven",
      "format": "LP, Comp",
      "rating": "",
      "releasedYear": 2017,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "DISC002",
      "releaseID": 4380497,
      "tracks": "",
      "artist": "Various",
      "title": "Disco Boogie Classics - Volume Two",
      "label": "Disco Boogie Classics",
      "format": "12, Unofficial",
      "rating": "",
      "releasedYear": 2013,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "KM047",
      "releaseID": 13316917,
      "tracks": "",
      "artist": "Various",
      "title": "Hand In Hand EP",
      "label": "Keinemusik",
      "format": "12, EP",
      "rating": "",
      "releasedYear": 2019,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "MFM030",
      "releaseID": 12575180,
      "tracks": "",
      "artist": "Victor W. Davis",
      "title": "Amerikan Dread",
      "label": "Music From Memory",
      "format": "12",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "TX 2018 002",
      "releaseID": 11988240,
      "tracks": "",
      "artist": "Virgo Four",
      "title": "Virgo",
      "label": "Trax Records",
      "format": "2x12, Album, RE",
      "rating": "",
      "releasedYear": 2018,
      "genre": "Uncategorized"
    },
    {
      "catalogID": "FVR127",
      "releaseID": 9374902,
      "tracks": "",
      "artist": "Voilaaa",
      "title": "On Te L’Avait Dit / Spies Are Watching Me (Remixes)",
      "label": "Favorite Recordings",
      "format": "12, Maxi",
      "rating": "",
      "releasedYear": 2016,
      "genre": "Uncategorized"
    }
  ]
}
const relatedTracks = [
  {
    id: '678',
    artist: 'Sue Avenue\'s Studio 58',
    title: 'Live At Expo \'58',
    song: 'Birds Of Paradise',
    trackNumber: 'DA',
    imageUrl:
      '../assets/img/covers/studio58.jpeg',
  }
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
    const sidebarOpen = ref(false)

    return {
      user,
      navigation,
      secondaryNavigation,
      tabs,
      profile,
      records,
      relatedTracks,
      sidebarOpen,
    }
  },
}
</script>