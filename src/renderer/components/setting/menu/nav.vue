<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{text('BACK')}}</header>
            <router-link :to="{name:'Setting.menu'}" tag="div" append>{{text('MENU')}}</router-link>
            <router-link :to="{name:'Setting.request'}" tag="div" append>{{text('REQUEST')}}</router-link>
            <router-link :to="{name:'Setting.template'}" tag="div" append>{{text('TEMPLATE')}}</router-link>
        </nav>
        <div class="content">
            <router-view @change="onChange" @unchange="change = false" class="inner"></router-view>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="save" class="update">{{text('SAVE')}}</span>
                    <span @click="cancel" class="cancel">{{text('CANCEL')}}</span>
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
            this.txt = this.text("TIP_SAVE_CONFIG");
            this.change = true;
            this.store = store;
            this.send = false;
        },
        update() {
            this.txt = this.text('SETTING_UPDATED');
            this.send = true;
            this.$socket.emit("[CMS] CONFIG_STORE", this.store);
            this.setConfig({ store: this.store })
            setTimeout(() => {
                this.cancel();
            }, 1500);
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