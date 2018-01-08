<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll'}">{{$t('nav.filter')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll.sheet'}">{{$t('nav.sheet')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" @setDate="setDate"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            query: null
        };
    },
    methods: {
        setDate(range) {
            this.$router.push({ name: "Setting.operator.payroll." });
        }
    }
};
</script>