<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text(init.title)}}</header>
            <div class="form">
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="item.zhCN">
                </div>
                <div class="input">
                    <label>{{text('US_EN')}}</label>
                    <input v-model="item.usEN" @keydown.enter="done">
                </div>
                <div class="input">
                    <label>{{text('PRICE')}}</label>
                    <input v-model="item.price" @keydown.enter="done">
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{text('CANCEL')}}</div>
                <div class="btn" @click="done">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        this.init.item && Object.assign(this.item, this.init.item);
    },
    data() {
        return {
            item: {}
        }
    },
    methods: {
        del() {
            this.init.reject(true)
        },
        done() {
            !isNumber(this.item.price) && (this.item.price = 0);
            !this.item.hasOwnProperty("key") && (this.item.key = Math.random().toString(36).substring(3,7));
            this.init.resolve(this.item)
        }
    }
}
</script>

<style scoped>
.form {
    padding: 15px 20px;
}

input {
    width: 100px;
}
</style>