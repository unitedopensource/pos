<template>
    <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{text('BACK')}}</header>
            <router-link :to="{name:'Setting.store'}" tag="div" append>{{text('BASIC_INFO')}}</router-link>
            <router-link :to="{name:'Setting.tax'}" tag="div" append>{{text('TAX_RATE')}}</router-link>
            <router-link :to="{name:'Setting.station'}" tag="div" append>{{text('STATION')}}</router-link>
            <router-link :to="{name:'Setting.dinein'}" tag="div" append>{{text('DINE_IN')}}</router-link>
        </nav>
        <div class="content">
            <router-view @change="onChange" @unchange="change = false" class="inner"></router-view>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="update" class="save">{{text('SAVE')}}</span>
                    <span @click="cancel" class="cancel">{{text('CANCEL')}}</span>
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
            send: false,
            store: null
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
        },
        ...mapActions(['setConfig'])
    }
}
</script>

<style>
section.route {
    display: flex;
}

nav.route {
    margin: 5px;
    background: #fff;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
    padding: 0px 0px 10px 0;
    width: 150px;
}


nav.route header {
    padding: 25px 10px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    background: #009688;
    color: #fff;
    text-shadow: 0 1px 1px #000;
}

nav.route i {
    margin-right: 5px;
}

nav.route div {
    padding: 8px 0 8px 10px;
    cursor: pointer;
    font-size: 1.25em;
    color: #555;
    transition: background 0.22s linear;
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;
}

section.route .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 733px;
}

section.route .content .inner {
    flex: 1;
    overflow: auto;
}

.router-link-exact-active {
    border-left: 3px solid #2196F3;
    background: rgba(236, 235, 235, 0.5);
    font-weight: bold;
}

section.route footer.update {
    background: #445359;
    color: #F7F9F8;
    padding: 20px 55px 20px 45px;
}

section.route footer.update i {
    color: #fdd333;
    margin-right: 5px;
}

section.route span.save {
    float: right;
    color: #fdd333;
    cursor: pointer;
}

section.route span.cancel {
    float: right;
    cursor: pointer;
    margin: 0 15px;
}
</style>