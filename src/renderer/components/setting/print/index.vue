<template>
    <div>
        <span @click="back">back</span>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    data(){
        return{}
    },
    methods:{
        back(){
            this.$router.push({ name:'Setting.index' })
        }
    }
}
</script>

<style>

</style>