<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.table'}" tag="div" append>{{$t('text.table')}}</router-link>
        </nav>
        <div class="content">
            <router-view class="inner"></router-view>
        </div>
    </section>
</template>

<script>
export default {
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        }
    }
}
</script>

<style></style>