<template>
  <div class="welcome">
      <p>Welcome</p>
      <div class="flex items-center min-h-screen bg-white dark:bg-gray-900">
        <div class="container mx-auto">
            <div v-if="showLogin" class="max-w-md mx-auto my-10">
                <div class="text-center">
                    <h1 class="my-3 text-3xl font-semibold text-gray-700 dark:text-gray-200">Login</h1>
                    <p class="text-gray-500 dark:text-gray-400">Log in to access your account</p>
                </div>
                <div class="m-7">
                    <login-form />
                    <p class="text-sm text-center text-gray-400">Don&#x27;t have an account yet? <a href="javascript:void(0)" @click="showLogin = false" class="text-indigo-400 focus:outline-none focus:underline focus:text-indigo-500 dark:focus:border-indigo-800">Sign up</a>.</p>
                </div>
            </div>
            <div v-else class="max-w-md mx-auto my-10">
                <div class="text-center">
                    <h1 class="my-3 text-3xl font-semibold text-gray-700 dark:text-gray-200">Signup</h1>
                    <p class="text-gray-500 dark:text-gray-400">Sign up to syart using synapse</p>
                </div>
                <div class="m-7">
                    <signup-form />
                    <p class="text-sm text-center text-gray-400">Already have an account? <a href="javascript:void(0)" @click="showLogin = true" class="text-indigo-400 focus:outline-none focus:underline focus:text-indigo-500 dark:focus:border-indigo-800">Log in</a>.</p>
                </div>
            </div>
        </div>
    </div>
  </div>






</template>

<script>
import SignupForm from'../components/SignupForm.vue'
import LoginForm from'../components/LoginForm.vue'
import { ref } from '@vue/reactivity'
export default {
    components: {SignupForm, LoginForm },

    setup() {
        const showLogin = ref(true)

        return { showLogin }
    }


}
</script>

<style>

</style>