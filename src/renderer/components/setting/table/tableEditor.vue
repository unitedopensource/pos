<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{$t('setting.tableEditor')}}</header>
            <div class="inner">
                <div class="input">
                    <label for="name">{{$t('text.name')}}</label>
                    <input v-model="table.name" id="name">
                </div>
                <div class="input">
                    <label for="zone">{{$t('text.section')}}</label>
                    <input v-model="table.zone" id="zone">
                </div>
                <div class="input">
                    <label for="name">{{$t('text.icon')}}</label>
                    <select v-model="table.shape">
                        <option v-for="(shape,index) in options" :key="index">{{shape}}</option>
                    </select>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            table: {},
            options: [
                "icon-table-set",
                "icon-round-couple",
                "icon-square-couple"
            ]
        }
    },
    mounted() {
        this.table = JSON.parse(JSON.stringify(this.init.table));
        this.table = Object.assign({}, {
            feature: [],
            guest: 0,
            server: "",
            time: null,
            grid: this.init.index,
            status: 1,
            name: "",
            shape: "",
        }, this.table)
    },

    methods: {
        confirm() {
            this.init.resolve(this.table)
        }
    }
}

</script>

<style></style>
