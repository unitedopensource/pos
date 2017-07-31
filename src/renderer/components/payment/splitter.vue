<template>
    <div class="window">
        <header class="title">
            <span>{{text('SPLIT_SELECTOR')}}</span>
            <i class="fa fa-times" @click="init.reject(false)"></i>
        </header>
    </div>
</template>

<script>
export default {
    props: ['init']
}
</script>

<style scoped>

</style>