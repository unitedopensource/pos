<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.operator.index'}">
                    <i class="fa fa-users"></i>
                    <span class="text">{{$t('nav.index')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.operator.profile'}" v-show="profile">
                    <i class="fa fa-user-circle-o"></i>
                    <span class="text">{{$t('nav.user')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.operator.event'}" v-show="profile">
                    <i class="fa fa-file-text"></i>
                    <span class="text">{{$t('nav.event')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page" @profile="setProfile" @change="onChange" @unchanged="change = false" :profile="profile"></router-view>
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
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            profile: null,
            change: false,
            send: false,
            temp:null,
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        onChange(operator) {
            this.txt = this.$t("text.saveSetting");
            this.temp = operator;
            this.change = true;
            this.send = false;
        },
        setProfile(operator) {
            this.profile = operator
        },
        update() {
            this.send = true;
            this.txt = this.$t('text.settingUpdated')
            this.$socket.emit("[CMS] UPDATE_USER", this.temp)
            this.profile._id === this.op._id && Object.assign(this.op, this.temp)
            setTimeout(() => { this.cancel() }, 1000)
        },
        cancel() {
            this.change = false;
            this.send = false;
        }
    },
    computed: {
        ...mapGetters(['op'])
    }
}
</script>