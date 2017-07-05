<template>
    <div class="layout">
        <div class="category">
            <div v-for="(category,index) in request" @click="getItems(category,index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
        </div>
        <div class="prefix">
            <div v-for="(action,index) in actions" @contextmenu="editAction(action,index)" :key="index">{{action[language]}}</div>
        </div>
        <div class="item">
            <div v-for="(item,index) in items" @contextmenu="editItem(item,index)" :class="{disable:!item.clickable}" :key="index">{{item[language]}}</div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import requestEditor from './requestEditor'
import dialoger from '../../common/dialoger'
import draggable from 'vuedraggable'
import Preset from '../../../preset'
export default {
    components: { requestEditor, dialoger, draggable },
    created() {
        this.items = [].concat.apply([], this.request[0].item);
    },
    data() {
        return {
            items: [],
            component: null,
            componentData: null,
            categoryIndex: 0
        }
    },
    methods: {
        getItems(category, index) {
            this.categoryIndex = index;
            this.items = [].concat.apply([], category.item);
        },
        editCategory(category, index) {
            console.log(category)
            new Promise((resolve, reject) => {
                this.componentData = {
                    resolve, reject,
                    data: category,
                    title: 'EDITOR.HEADER.REQUEST',
                    type: 'category'
                }
                this.component = "requestEditor"
            }).then(result => {
                result.item = [];
                console.log(result);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        editAction(action, index) {
            console.log(action)
            new Promise((resolve, reject) => {
                this.componentData = {
                    resolve, reject,
                    data: action,
                    title: 'EDITOR.HEADER.ACTION',
                    type: 'action'
                }
                this.component = "requestEditor"
            }).then(result => {
                console.log(result);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        editItem(item, index) {
            new Promise((resolve, reject) => {
                this.componentData = {
                    resolve, reject,
                    data: item,
                    title: 'EDITOR.HEADER.ITEM',
                    type: 'item'
                }
                this.component = "requestEditor"
            }).then(result => {
                console.log(result);
                this.$exitComponent();
            }).catch(del => {
                del && this.$socket.emit("[CMS] REMOVE_REQUEST_ITEM",{id:item._id})
                this.$exitComponent();
            })
        },
        ...mapActions(['update'])
    },
    computed: {
        ...mapGetters(['request', 'language', 'actions'])
    }
}
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
}

.category,
.prefix {
    width: 142px;
}

.prefix div {
    height: 62.5px;
    width: 137.92px;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    border: 1px solid #607D8B;
    background: #B0BEC5;
    margin: 1px;
    vertical-align: top;
    font-size: 1.15em;
    text-align: center;
}

.item {
    width: 410px;
}

.item div {
    display: inline-flex;
    text-align: center;
    flex-wrap: wrap;
    width: calc(33% - 3px);
    justify-content: center;
    align-items: center;
    height: 62.5px;
    border: 1px solid #78909C;
    margin: 1px;
    background: #92aaaf;
    vertical-align: top;
    font-size: 1.05em;
}

.item div.disable {
    background: rgba(207, 216, 220, 0.58);
}
</style>