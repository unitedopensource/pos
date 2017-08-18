<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>{{text('EDITOR.HEADER.TEMPLATE')}}</div>
                <div class="name">
                    <i class="fa fa-pencil"></i>
                    <input v-model="template.template">
                </div>
                <checkbox v-model="template.insert" label="INSERT"></checkbox>
            </header>
            <div class="includes">
                <draggable v-model="template.contain" :options="{animation:300,group:'item',ghostClass:'itemGhost',draggable:'.draggable'}">
                    <transition-group tag="aside">
                        <div class="group draggable" v-for="(group,index) in template.contain" :key="index" @click="setGroup(index)">
                            <h3>{{group.name}}</h3>
                            <span>{{group.contain.length}} {{text('ITEMS')}}</span>
                            <i class="fa fa-times" @click="delGroup(index)"></i>
                        </div>
                        <div class="addGroup" @click="addGroup" :key="999">
                            <i class="fa fa-plus"></i>
                        </div>
                    </transition-group>
                </draggable>
                <div class="container">
                    <div v-if="container">
                        <div class="config">
                            <div>
                                <label>{{text('NAME')}}</label>
                                <input v-model="container.name">
                                <label>{{text('EDITOR.TEMPLATE.MAX')}}</label>
                                <input v-model.number="container.max">
                            </div>
                            <div>
                                <label>{{text('EDITOR.TEMPLATE.STARTAT')}}</label>
                                <input v-model.number="container.startAt">
                                <label>{{text('EDITOR.TEMPLATE.ADDITION')}}</label>
                                <input v-model.number="container.addition">
                            </div>
                        </div>
                        <draggable v-model="container.contain" :options="{animation:300,group:'item',ghostClass:'itemGhost',draggable:'.draggable'}">
                            <transition-group tag="ul" class="item">
                                <li v-for="(item,index) in container.contain" @contextmenu="editItem(item,index)" :key="index" class="draggable">{{item[language]}}</li>
                                <li class="addItem" @click="addItem" :key="999" v-show="container.contain.length < 24">
                                    <i class="fa fa-plus"></i>
                                </li>
                            </transition-group>
                        </draggable>
                    </div>
                    <div v-else>
    
                    </div>
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
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import checkbox from '../common/checkbox'
import draggable from 'vuedraggable'
import editor from './templateItem'
export default {
    components: { editor, checkbox, draggable },
    props: ['init'],
    created() {
        this.template = JSON.parse(JSON.stringify(this.init.template));
    },
    mounted() {
        this.setGroup(0);
    },
    data() {
        return {
            template: null,
            container: null,
            component: null,
            componentData: null,
            index: 0
        }
    },
    methods: {
        setGroup(index) {
            this.index = index;
            let dom = document.querySelector(".group.active");
            dom && dom.classList.remove("active");
            dom = document.querySelectorAll(".group");
            dom[index] && dom[index].classList.add("active");
            this.container = this.template.contain[index]
        },
        addGroup() {
            this.template.contain.push({
                name: "New",
                addition: 0,
                startAt: 0,
                contain: []
            })
        },
        delGroup(index) {
            this.template.contain.splice(index, 1);
        },
        addItem() {
            new Promise((resolve, reject) => {
                let title = "NEW_ITEM"
                this.componentData = { resolve, reject, title };
                this.component = "editor";
            }).then((item) => {
                this.template.contain[this.index].contain.push(item);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        editItem(item, index) {
            new Promise((resolve, reject) => {
                let title = "EDIT_ITEM";
                this.componentData = { resolve, reject, title, item };
                this.component = "editor";
            }).then((item) => {
                this.template.contain[this.index].contain.splice(index, 1, item);
                this.$exitComponent();
            }).catch((del) => {
                del && this.template.contain[this.index].contain.splice(index, 1);
                this.$exitComponent();
            })
        },
        del() {
            this.init.reject(true);
        },
        confirm() {
            this.init.resolve(this.template)
        }
    },
    computed: {
        ...mapGetters(['language'])
    }
}
</script>

<style scoped>
header {
    display: flex;
    align-items: center;
}

header .name {
    margin-left: 15px;
    flex: 1;
}

header .text {
    font-weight: initial;
    font-family: 'Yuanti-SC';
}

.name input {
    border: none;
    background: transparent;
    color: #fff;
    border-bottom: 1px solid #9ec8ca;
    font-size: 1em;
    width: 150px;
    padding: 0 5px;
    font-style: italic;
}

aside {
    width: 140px;
    border-right: 1px solid #eee;
    background: #fff;
}

.container {
    flex-direction: column;
    position: relative;
}

.container>div {
    width: 100%;
}

.includes {
    display: flex;
    background: #F5F5F5;
    min-height: 500px;
    width: 600px;
}

.group {
    padding: 5px 10px;
    height: 40px;
    cursor: pointer;
    color: #9E9E9E;
    position: relative;
    border: 1px solid transparent;
    border-left: 2px solid transparent;
}

.group.active {
    border-left: 2px solid #2196F3;
    background: #F5F5F5;
    color: #3c3c3c;
}

.addGroup {
    padding: 15px;
    width: 107px;
    text-align: center;
    border: 2px dashed #ddd;
    color: #ccc;
    background: #FAFAFA;
    cursor: pointer;
}

.addItem {
    color: #666;
    border: 1px dashed #ddd;
    cursor: pointer;
}

.config input {
    border: 1px solid #ddd;
    width: 100px;
}

.config {
    padding: 10px 0;
    border-bottom: 1px dashed #ddd;
    width: 100%;
    text-align: center;
    background: #fff;
}

ul.item {
    display: flex;
    flex-wrap: wrap;
    padding: 10px 28px;
}

li {
    width: 100px;
    height: 60px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px;
    border: 1px solid #eee;
    background: #fff;
    margin: 1px;
}

.group i {
    color: var(--red);
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 16px;
    display: none;
}

.group.active i {
    display: block;
}

.itemGhost {
    opacity: 0.5;
    border: 1px dashed gray;
}
</style>