<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.menu'}" tag="div" append>{{$t('setting.menu')}}</router-link>
            <router-link :to="{name:'Setting.request'}" tag="div" append>{{$t('setting.request')}}</router-link>
            <router-link :to="{name:'Setting.template'}" tag="div" append>{{$t('setting.template')}}</router-link>
            <router-link :to="{name:'Setting.display'}" tag="div" append>{{$t('setting.display')}}</router-link>
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
import { mapActions } from 'vuex'
export default {
    data() {
        return {
            change: false,
            send: false
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        onChange(ctrl) {
            this.txt = this.$t("text.saveSetting");
            this.change = true;
            this.ctrl = ctrl;
            this.send = false;
        },
        update() {
            this.txt = this.$t('settingUpdated');
            this.send = true;
            this.$socket.emit("[CMS] CONFIG_DISPLAY", this.ctrl);
            this.setConfig({ display: this.ctrl });
            setTimeout(() => { this.cancel() }, 1500);
        },
        cancel() {
            this.ctrl = null;
            this.change = false;
            this.send = false;
        },
        ...mapActions(['setConfig'])
    }
}
</script>

<style></style>