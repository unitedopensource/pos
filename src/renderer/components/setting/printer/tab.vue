<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.printer'}">{{$t('text.printer')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.printer.config'}">{{$t('text.config')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.print.style'}">{{$t('text.style')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.print.other'}">{{$t('text.other')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {}
};
</script>