<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>IP SEARCH</header>
            <div class="wrap">
                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" v-model.number="port" @keydown.enter="search">
                    <i class="fa fa-times"></i>
                </div>
            </div>
            <ul class="results">
                <li v-for="(ip,index) in results" @click="select(ip)" :key="index">{{ip}}</li>
            </ul>
            <footer>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            port: 10009,
            results: []
        }
    },
    methods: {
        search() {


        },
        select(ip) {

        },
        confirm() {

        }
    }
}
</script>

<style scoped>
.search {
    padding: 5px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    font-size: 1.25em;
    color: #333;
}

.search input {
    flex: 1;
    width: auto;
    border: none;
    outline: none;
    padding: 0 10px;
}
</style>
