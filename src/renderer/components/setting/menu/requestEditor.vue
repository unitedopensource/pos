<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{$t(init.title)}}</header>
            <div class="inner" v-if="init.type === 'category'">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input v-model="request.zhCN">
                </div>
                <div class="input">
                    <label>{{$t('text.contain')}}</label>
                    <input v-model="request.contain">
                </div>
            </div>
            <div class="inner" v-else-if="init.type === 'action'">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input v-model="request.zhCN">
                </div>
                <div class="default">
                    <checkbox v-model="request.prefix" label="text.prefix"></checkbox>
                </div>
            </div>
            <div class="inner" v-else-if="init.type === 'item'">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input v-model="request.usEN">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input v-model="request.zhCN">
                </div>

                <div class="input">
                    <label>{{$t('text.category')}}</label>
                    <select v-model="request.category">
                        <option v-for="(category,index) in init.category" :key="index">{{category}}</option>
                    </select>
                </div>
                <div class="input">
                    <label>{{$t('text.price')}}</label>
                    <input v-model.number="request.price">
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del" v-show="request._id">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
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
            switch (this.init.type) {
                case "item":
                    this.$socket.emit("[CMS] REMOVE_REQUEST_ITEM", {
                        id: this.request._id,
                        grp: this.init.grp,
                        sub: this.init.sub,
                        index: this.init.index
                    });
                    break;
            }
            this.init.resolve()
        },
        confirm() {
            switch (this.init.type) {
                case "category":
                    this.request.item = [];
                    !Array.isArray(this.request.contain) && (this.request.contain = this.request.contain.split(","));
                    this.$socket.emit("[CMS] UPDATE_REQUEST_CATEGORY", { category: this.request, index: this.init.index });
                    break;
                case "action":
                    this.$socket.emit("[CMS] UPDATE_REQUEST_ACTION", {
                        action: this.request,
                        index: this.init.index
                    })
                    break;
                case "item":
                    !isNumber(this.request.price) && (this.request.price = 0);
                    this.$socket.emit("[CMS] UPDATE_REQUEST_ITEM", {
                        item: this.request,
                        grp: this.init.grp,
                        sub: this.init.sub,
                        index: this.init.index
                    });
                    break;
            }
            this.init.resolve()
        },
        ...mapActions(['updateRequestCategory'])
    }
}
</script>