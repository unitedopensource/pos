<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('TABLE_EDITOR')}}</header>
            <div class="inner">
                <div class="input">
                    <label for="name">{{text('name')}}</label>
                    <input v-model="table.name" id="name">
                </div>
                <div class="input">
                    <label for="zone">{{text('ZONE')}}</label>
                    <input v-model="table.zone" id="zone">
                </div>
                <div class="input">
                    <label for="name">{{text('SHAPE')}}</label>
                    <select v-model="table.shape">
                        <option v-for="shape in options">{{shape}}</option>
                    </select>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    components: {},
    mounted() {
        this.table = JSON.parse(JSON.stringify(this.init.table));
        this.table = Object.assign({}, {
            current: {
                color: "",
                group: "",
                guest: 0,
                invoice: [],
                server: "",
                time: ""
            },
            feature: {},
            grid: this.init.index,
            status: 1,
            name: "",
            shape: "",
        }, this.table)
    },
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
    methods: {
        confirm() {
            this.init.resolve(this.table)
        }
    }
}

</script>

<style></style>
