<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
<div v-if="user" class="rounded-lg bg-white overflow-hidden shadow">
  <h2 class="sr-only" id="profile-overview-title">Profile Overview</h2>
  <div class="bg-white p-6">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div class="sm:flex sm:space-x-5">
        <div class="flex-shrink-0">
          <img class="mx-auto h-20 w-20 rounded-full" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixqx=rg0LJKySl7&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
        </div>
        <div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
          <p class="text-sm font-medium text-gray-600">Welcome back,</p>
          <p class="text-xl font-bold text-gray-900 sm:text-2xl">{{ user.displayName }} </p>
          <p class="text-sm font-medium text-gray-600">{{ user.email }} </p>
        </div>
      </div>
      <div class="mt-5 flex justify-center sm:mt-0">
        <button @click="handleClick" class="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          logout
        </button>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import useLogout from '../composables/useLogout'
import getUser from '../composables/getUser'
import { useRouter } from 'vue-router'

export default {
    setup(props,context) {
        const {logout , error} = useLogout()
        const { user } = getUser()

        const router = useRouter()

        const handleClick = async () => {
            await logout()
            if(!error.value){
                console.log('user logged out')
                router.push('/')
            }
        }
    return { handleClick, user }
    }
}
</script>

<style>

</style>