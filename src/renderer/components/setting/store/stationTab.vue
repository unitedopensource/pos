<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.station'}">{{$t('setting.station')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.station.interface'}">{{$t('setting.interface')}}</router-link>
        </ul>
        <router-view class="tab-content"></router-view>
    </div>
</template>