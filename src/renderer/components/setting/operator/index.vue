<template>
    <div>
        <span @click="back">Back</span>
    </div>
</template>

<script>
export default{
    methods:{
        back(){
            this.$router.push({name:"Setting.index"})
        }
    }
}
</script>

<style>

</style>