<template>
  <div class="welcome">
      <p>Welcome</p>
      <div v-if="showLogin">
            <h2>Login</h2>
            <login-form />    
            <p>No Account yet? <a href="javascript:void(0)" @click="showLogin = false"> Sign up</a></p>
      </div>
      <div v-else>
          <h2>Signup</h2>
          <signup-form />
            <p>Already registered? <a href="javascript:void(0)" @click="showLogin = true"> Log in</a></p>
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