<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>IP SEARCH</header>
            <div class="inner"></div>
            <footer>
                <div class="btn" @click="confirm"></div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            port: '10009',
            results: []
        }
    },
    created() {

    },
    methods: {
        select(ip) {

        },
        confirm() {

        }
    }
}
</script>

<style scoped>
.search{
    background: #fff;
}
header{
    height: 25px;
    background: #eee;
}
input{
    border:none;
}
</style>
