<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.store'}">{{$t('setting.storeInfo')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.payment'}">{{$t('setting.payment')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.security'}">{{$t('setting.security')}}</router-link>
            
        </ul>
        <router-view class="tab-content"></router-view>
    </div>
</template>