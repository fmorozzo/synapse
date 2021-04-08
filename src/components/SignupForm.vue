<template>
  <form @submit.prevent="handleSubmit">
      <input type="text" required placeholder="Display name" v-model="displayName">
      <input type="email" required placeholder="email" v-model="email">
      <input type="password" required placeholder="Password" v-model="password">
      <button>Sign up</button>
  </form>
</template>

p<script>
import { ref } from '@vue/reactivity'
export default {

    setup(){
        const displayName = ref('')
        const email = ref('')
        const password = ref('')
   
        const handleSubmit = () => {
            console.log(displayName.value,email.value,password.value)
        }
        return {displayName, email, password, handleSubmit}
    }
}
</script>

<style>

</style>