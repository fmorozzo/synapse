<template>
  <navbar />
</template>

<script>
import { watch } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import getUser from '../composables/getUser'

export default {
    components: {
        Navbar
    },
    setup(){
        const { user } = getUser()
        const router = useRouter()

        watch(user, () => {
            if(!user.value){
                router.push({name : 'Welcome'})
            }
        })
    }
}
</script>

<style>

</style>