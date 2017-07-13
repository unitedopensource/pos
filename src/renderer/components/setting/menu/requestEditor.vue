<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text(init.title)}}</header>
            <div class="inner" v-if="init.type === 'category'">
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="request.zhCN">
                </div>
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="input">
                    <label>{{text('CONTAIN')}}</label>
                    <input v-model="request.contain">
                </div>
            </div>
            <div class="inner" v-else-if="init.type === 'action'">
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="request.zhCN">
                </div>
                <div class="input">
                    <label>{{text('US_EN')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="default">
                    <checkbox v-model="request.prefix" label="PREFIX_VERB"></checkbox>
                </div>
            </div>
            <div class="inner" v-else-if="init.type === 'item'">
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="request.zhCN">
                </div>
                <div class="input">
                    <label>{{text('US_EN')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="input">
                    <label>{{text('CATEGORY')}}</label>
                    <select v-model="request.category">
                        <option v-for="category in init.category">{{category}}</option>
                    </select>
                </div>
                <div class="input">
                    <label>{{text('PRICE')}}</label>
                    <input v-model.number="request.price">
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from '../common/checkbox'
export default {
    components: { checkbox },
    props: ['init'],
    created() {
        this.request = JSON.parse(JSON.stringify(this.init.data));
    },
    data() {
        return {
            request: null
        }
    },
    methods: {
        del() {
            this.init.reject(true);
        },
        confirm() {
            this.init.resolve(this.request)
        }
    }
}
</script>

<style></style>