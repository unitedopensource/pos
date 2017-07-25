<template>
    <div class="layout">
        <draggable v-model="sections" @sort="sortSection" :options="{animation: 300,group: 'section',ghostClass: 'sectionGhost',draggable:'.draggable'}">
            <transition-group tag="section" class="section">
                <div class="btn draggable" v-for="(section,index) in sections" @click="viewSection(section,index)" @contextmenu="editSection(section,index)" :key="index">{{section[language]}}</div>
                <div class="btn add" @click="addSection" :key="-1">
                    <i class="fa fa-plus"></i>
                </div>
                <div class="apply" :key="-2">
                    <div class="btn" @click="applySectionSort" v-show="isSectionSort">{{text('APPLY')}}</div>
                    <div class="btn" @click="applyTableSort" v-show="isTableSort">{{text('APPLY')}}</div>
                </div>
            </transition-group>
        </draggable>
        <draggable v-model="tabs" @sort="sortTable" :options="{animation: 300,group: 'table',ghostClass: 'tableGhost'}" class="f1">
            <transition-group tag="section" class="tables">
                <div class="table" v-for="(table,index) in tabs" @contextmenu="editTable(table,index)" :key="index">
                    <span :class="[table.shape]" class="icon"></span>
                    <span class="name">{{table.name}}</span>
                </div>
            </transition-group>
        </draggable>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import dialoger from '../../common/dialoger'
import sectionEditor from './sectionEditor'
import tableEditor from './tableEditor'
export default {
    components: {
        draggable, dialoger, sectionEditor, tableEditor
    },
    data() {
        return {
            tabs: [],
            sections: [],
            currentSection: 0,
            component: null,
            componentData: null,
            isSectionSort: false,
            isTableSort: false,
        }
    },
    created() {
        this.sections = JSON.parse(JSON.stringify(this.tables));
        this.tabs = JSON.parse(JSON.stringify(this.sections[0].item));
    },
    methods: {
        viewSection(section, index) {
            this.currentSection = index;
            this.tabs = section.item.length !== 0 ? section.item : Array(56).fill({ name: "", shape: "", zone: section.zone });
        },
        addSection() {
            this.sections.push({
                zhCN: "New",
                usEN: "New",
                zone: "New",
                item: []
            })
        },
        editSection(section, index) {
            new Promise((resolve, reject) => {
                this.componentData = { section, resolve, reject };
                this.component = "sectionEditor";
            }).then((result) => {
                console.log(result)
                this.sections.splice(index, 1, result);
                this.$socket.emit("[CMS] EDIT_TABLE_SECTION", { section: result, index });
                this.$exitComponent();
            }).catch((remove) => {
                remove ? this.$dialog({ title: "TABLE_SECTION_REMOVE", msg: "TIP_REMOVE_TABLE_SECTION" }).then(() => {
                    this.removeSection(index);
                    this.$exitComponent();
                }).catch(() => {
                    this.$exitComponent();
                }) :
                    this.$exitComponent();
            })
        },
        editTable(table, index) {
            table.zone = this.sections[this.currentSection].zone;
            new Promise((resolve, reject) => {
                this.componentData = { table, resolve, reject, index }
                this.component = "tableEditor";
            }).then((table) => {
                this.tabs.splice(index, 1, table);
                this.$socket.emit("[CMS] TABLE_MODIFY", { table, index, section: this.currentSection });
                this.$exitComponent();
            }).catch((remove) => {
                remove ? this.$dialog({ title: "TABLE_REMOVE", msg: "TIP_TABLE_REMOVE" }).then(() => {
                    this.removeTable(table, index);
                    this.$exitComponent();
                }).catch(() => {
                    this.$exitComponent();
                }) : this.$exitComponent();
            });
        },
        sortSection() {
            this.isSectionSort = true;
            console.log(this.sections)
        },
        sortTable() {
            this.isTableSort = true;
        },
        applySectionSort() {
            this.$socket.emit("[CMS] TABLE_SECTION_SORT", this.sectionSorted);
            this.isSectionSort = false;
            this.sectionSorted = null;
        },
        applyTableSort() {
            let table = this.tabs.map((table, index) => {
                table.grid = index;
                return {
                    _id: table._id,
                    grid: table.grid
                };
            }).filter(table => table._id);
            this.$socket.emit("[CMS] TABLE_SORT", table);
            this.setTableSort({ tables: this.tabs, index: this.currentSection });
            this.isTableSort = false;
            this.tableSorted = null;
        },
        removeSection(index) {
            this.sections.splice(index, 1);
            this.$socket.emit("[CMS] REMOVE_TABLE_SECTION", index);
        },
        removeTable(table, index) {
            table._id && this.$socket.emit("[CMS] REMOVE_TABLE",table._id);
            console.log(table);
            this.tabs.splice(index,1,{
                current:{},
                feature:{},
                grid:index,
                name:"",
                shape:"",
                status:1,
                zone:""
            })
        },
        ...mapActions(['setTableSort'])
    },
    computed: {
        ...mapGetters(['tables', 'language'])
    }
}

</script>

<style scoped>
.layout {
    display: flex;
}

section.section {
    margin: 5px;
    display: flex;
    flex-direction: column;
    height: 726px;
}

.tables {
    display: flex;
    flex-wrap: wrap;
    padding: 2px 2px 2px 0;
}

.table {
    display: inline-flex;
    flex-direction: column;
    width: 87.5px;
    height: 96px;
    background: linear-gradient(135deg, rgb(245, 247, 250) 0%, rgb(195, 207, 226) 110%);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    margin: 4px;
    justify-content: center;
    align-items: center;
}

.icon {
    font-size: 4.5em;
}

.tableGhost {
    opacity: 0.5;
}

.apply {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
</style>