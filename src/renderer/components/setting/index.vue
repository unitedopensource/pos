<template>
    <section class="index">
        <h3>{{text('SETTING.HEAD.TITLE')}}</h3>
        <section class="grid">
            <figure @click="go('Setting.store')">
                <i class="fa fa-2x fa-cogs"></i>
                <figcaption>{{text('STORE')}}</figcaption>
                <span class="intro">{{text('SETTING.STORE.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.menu')">
                <i class="fa fa-2x fa-table"></i>
                <figcaption>{{text('MENU')}}</figcaption>
                <span class="intro">{{text('SETTING.MENU.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.table')">
                <i class="fa fa-2x fa-cutlery"></i>
                <figcaption>{{text('SEAT')}}</figcaption>
                <span class="intro">{{text('SETTING.SEAT.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.online')">
                <i class="fa fa-2x fa-globe"></i>
                <figcaption>{{text('ONLINE_ORDER')}}</figcaption>
                <span class="intro">{{text('SETTING.ONLINE.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.print')">
                <i class="fa fa-2x fa-print"></i>
                <figcaption>{{text('PRINT')}}</figcaption>
                <span class="intro">{{text('SETTING.PRINT.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.operator')">
                <i class="fa fa-2x fa-users"></i>
                <figcaption>{{text('OP')}}</figcaption>
                <span class="intro">{{text('SETTING.USERS.TIP')}}</span>
            </figure>
            <figure @click="go('Setting.database')">
                <i class="fa fa-2x fa-database"></i>
                <figcaption>{{text('DATABASE')}}</figcaption>
                <span class="intro">{{text('SETTING.DATABASE.TIP')}}</span>
            </figure>
            <figure>
                <i class="fa fa-2x fa-list-alt"></i>
                <figcaption>{{text('THIRD_PARTY')}}</figcaption>
                <span class="intro">{{text('SETTING.THIRDPARTY.TIP')}}</span>
            </figure>
            <figure>
                <i class="fa fa-2x fa-money"></i>
                <figcaption>{{text('SALES')}}</figcaption>
                <span class="intro">{{text('SETTING.SALES.TIP')}}</span>
            </figure>
            <figure v-if="op.role === 'Admin'">
                <i class="fa fa-2x fa-refresh"></i>
                <figcaption>{{text('SYSTEM')}}</figcaption>
                <span class="intro">{{text('SETTING.SYSTEM.TIP')}}</span>
            </figure>
            <figure @click="go('Dashboard')">
                <i class="fa fa-2x fa-external-link"></i>
                <figcaption>{{text('EXIT')}}</figcaption>
                <span class="intro">{{text('SETTING.EXIT.TIP')}}</span>
            </figure>
        </section>
        <section class="about">
            <div>
                <span class="text">Host:</span>
                <span class="value">{{about.host}}</span>
            </div>
            <div>
                <span class="text">Version:</span>
                <span class="value">{{about.version}} ({{about.build | moment('MMDD')}})</span>
            </div>
            <div>
                <span class="text">Support:</span>
                <span class="value">{{about.support}}</span>
            </div>
        </section>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            about: {}
        }
    },
    created() {
        this.$socket.emit("ABOUT", (us) => { this.about = us })
    },
    methods: {
        go(name) {
            this.$router.push({ name })
        }
    },
    computed: {
        ...mapGetters(['op'])
    }
}
</script>

<style scoped>
.index {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
    margin: 3em 0;
    position: relative;
}

h3 {
    font-size: 2em;
    font-family: 'Microsoft YaHei';
    color: #666;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 3em 0;
}

figure {
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    padding: 20px 10px 10px;
    height: 104px;
    width: 170px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

figure:active {
    background: #f6f6f6;
    color: #666;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45);
}

figure i {
    color: #1E88E5;
}

figcaption {
    font-family: 'Microsoft YaHei';
    font-weight: bold;
    margin-top: 10px;
    color: #3c3c3c;
    font-size: 1.25em;
}

.intro {
    color: gray;
    text-align: center;
}

section.about {
    position: fixed;
    left: 5px;
    bottom: 5px;
}

section.about>div {
    display: flex;
    width: 180px;
}

section.about .value {
    flex: 1;
    text-align: right;
    color: #37474F;
}
</style>