<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.store'}">
                    <i class="fa fa-home"></i>
                    <span class="text">{{$t('nav.store')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.station'}">
                    <i class="fa fa-desktop"></i>
                    <span class="text">{{$t('nav.station')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.tax'}">
                    <i class="fa fa-usd"></i>
                    <span class="text">{{$t('nav.tax')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.dinein'}">
                    <i class="fa fa-cutlery"></i>
                    <span class="text">{{$t('nav.dineIn')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.exit')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page" @change="onChange" @unchange="change = false"></router-view>
            </transition>
            <transition appear name="fadeUp">
                <footer class="update" v-if="change">
                    <i class="fa fa-info-circle"></i>
                    <p class="f1">{{txt}}</p>
                    <div v-show="!send">
                        <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                        <span @click="update" class="save">{{$t('button.save')}}</span>
                    </div>
                </footer>
            </transition>
        </section>
    </section>
    <!-- <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.store'}" tag="div" append>{{$t('setting.storeInfo')}}</router-link>
            <router-link :to="{name:'Setting.station'}" tag="div" append>{{$t('setting.station')}}</router-link>
            <router-link :to="{name:'Setting.tax'}" tag="div" append>{{$t('setting.tax')}}</router-link>
            <router-link :to="{name:'Setting.dinein'}" tag="div" append>{{$t('setting.dineIn')}}</router-link>
        </nav>
        <div class="content">
            <router-view @change="onChange" @unchange="change = false" class="inner"></router-view>
            <transition appear name="fadeUp">
                <footer class="update" v-if="change">
                    <i class="fa fa-info-circle"></i>
                    <p class="f1">{{txt}}</p>
                    <div v-show="!send">
                        <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                        <span @click="update" class="save">{{$t('button.save')}}</span>
                    </div>
                </footer>
            </transition>
        </div>
    </section> -->
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    data() {
        return {
            change: false,
            send: false,
            store: null
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        onChange(store) {
            this.txt = this.$t("text.saveSetting");
            this.change = true;
            this.store = store;
            this.send = false;
        },
        update() {
            this.txt = this.$t('text.settingUpdated');
            this.send = true;
            this.$socket.emit("[CMS] CONFIG_STORE", this.store);
            this.setConfig({ store: this.store });
            this.setApp({ autoLock: false });
            this.updateStation(this.store);
            setTimeout(() => { this.cancel() }, 1000);
        },
        updateStation(store) {
            let { station } = store;
            let { mac } = this.station;
            for (var name in station) {
                station[name].mac === mac && this.setStation(station[name])
            }
        },
        cancel() {
            this.store = null;
            this.change = false;
            this.send = false;
        },
        ...mapActions(['setApp', 'setConfig', 'setStation'])
    },
    computed: {
        ...mapGetters(['station'])
    }
}
</script>

<style></style>