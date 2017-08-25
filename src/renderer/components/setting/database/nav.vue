<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.database'}" tag="div" append>{{$t('setting.database')}}</router-link>
            <router-link :to="{name:'Setting.address'}" tag="div" append>{{$t('setting.address')}}</router-link>
            <router-link :to="{name:'Setting.client'}" tag="div" append>{{$t('setting.clinet')}}</router-link>
            <router-link :to="{name:'Setting.call'}" tag="div" append>{{$t('setting.call')}}</router-link>
        </nav>
        <div class="content">
            <router-view @change="onChange" @unchange="change = false" class="inner"></router-view>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="save" class="update">{{$t('button.save')}}</span>
                    <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                </span>
            </footer>
        </div>
    </section>
</template>

<script>
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
        onChange(store) {
            this.txt = this.$t("text.saveSetting");
            this.change = true;
            this.store = store;
            this.send = false;
        },
        update() {
            this.txt = this.$t('text.settingUpdated');
            this.send = true;
            // this.$socket.emit("[CMS] CONFIG_STORE", this.store);
            // this.setConfig({ store: this.store })
            // setTimeout(() => {
            //     this.cancel();
            // }, 1500);
        },
        cancel() {
            this.store = null;
            this.change = false;
            this.send = false;
        }
    }
}
</script>

<style></style>