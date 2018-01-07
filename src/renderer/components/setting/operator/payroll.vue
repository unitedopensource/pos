<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll'}">{{$t('nav.filter')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll.calendar'}">{{$t('nav.calendar')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.operator.payroll.sheet'}">{{$t('nav.sheet')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" @set="setOperator"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            operator: null
        };
    },
    methods: {
        setOperator(operator) {
            this.operator = operator;
            this.$router.push({
                name: "Setting.operator.config",
                params: { operator }
            });
        }
    }
};
</script>