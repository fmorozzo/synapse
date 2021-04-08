<template>
  <form @submit.prevent="handleSubmit">
        <div class="mb-6">
            <label for="displayName" class="block mb-2 text-sm text-gray-600 dark:text-gray-400">Display Name</label>
            <input type="displayName" name="displayName" id="displayName" placeholder="Your dispolay name"  v-model="displayName" required class="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500" />
        </div>
        <div class="mb-6">
            <label for="email" class="block mb-2 text-sm text-gray-600 dark:text-gray-400">Email Address</label>
            <input type="email" name="email" id="email" placeholder="you@company.com"  v-model="email" required class="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500" />
        </div>
        <div class="mb-6">
            <div class="flex justify-between mb-2">
                <label for="password" class="text-sm text-gray-600 dark:text-gray-400">Password</label>
                <a href="/" class="text-sm text-gray-400 focus:outline-none focus:text-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-300">Forgot password?</a>
            </div>
            <input type="password" name="password" id="password" placeholder="Your Password" v-model="password" required class="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500" />
            <div class="text-red-500 my-2" >
                {{ error }}
            </div>
        </div>
        <div class="mb-6">
            <button class="w-full px-3 py-4 text-white bg-indigo-500 rounded-md focus:bg-indigo-600 focus:outline-none">Sign up</button>
        </div>
    </form>
</template>

<script>
import { ref } from '@vue/reactivity'
import useSignup from '../composables/useSignup'

export default {

    setup(props, context){
        const {error, signup} = useSignup()

        const displayName = ref('')
        const email = ref('')
        const password = ref('')
   
        const handleSubmit = async () => { 
            await signup(email.value, password.value, displayName.value)
            if(!error.value){
                context.emit('signup')
            }
        }
        return {displayName, email, password, handleSubmit, error}
    }
}
</script>

<style>

</style>