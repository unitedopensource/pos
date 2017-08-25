<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.online.config'}" tag="div" append>{{$t('setting.config')}}</router-link>
            <router-link :to="{name:'Setting.online.menu'}" tag="div" append>{{$t('setting.menu')}}</router-link>
        </nav>
        <div class="content">
            <router-view @change="onChange" @unchange="change = false" class="inner"></router-view>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="update" class="save">{{$t('button.save')}}</span>
                    <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                </span>
            </footer>
        </div>
    </section>
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
            this.setConfig({ store: this.store })
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
        ...mapActions(['setConfig', 'setStation'])
    },
    computed: {
        ...mapGetters(['station'])
    }
}
</script>

<style></style>