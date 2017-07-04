<template>
    <div class="layout">
        <div class="category">
            <div v-for="(category,index) in request" @click="getItems(category)" @contextmenu="editCategory(category)" :key="index">{{category[language]}}</div>
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
    // mounted() {
    //     window.addEventListener("keydown", this.input, false);
    // },
    data() {
        return {
            items: [],
            component: null,
            componentData: null,
            pointIndex: 0
        }
    },
    methods: {
        getItems(category) {
            this.items = [].concat.apply([], category.item);
        },
        editCategory(category) {
            console.log(category)
        },
        editAction(action) {
            console.log(action)
        },
        editItem(item){

        }
        // input(){

        // }
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