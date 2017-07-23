<template>
    <div class="layout">
        <draggable v-model="sections" @sort="sortSection" :options="dragSection">
            <transition-group tag="section" class="section">
                <div class="btn" v-for="(section,index) in sections" @click="viewSection(section)" :key="index">{{section[language]}}</div>
            </transition-group>
        </draggable>
        <draggable v-model="tabs" @sort="sortTable" :options="dragTable">
            <transition-group tag="section" class="tables">
                <div class="table" v-for="(table,index) in tabs" @contextmenu="editTable(table)" :key="index">
                    <span :class="[table.shape]" class="icon"></span>
                    <span class="name">{{table.name}}</span>
                </div>
            </transition-group>
        </draggable>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
export default {
    components: {
        draggable
    },
    data() {
        return {
            currentSection: 0,
            sections: [],
            tabs: [],
            component: null,
            componentData: null,
            dragSection: {
                animation: 300,
                group: 'section',
                ghostClass: 'sectionGhost'
            },
            dragTable: {
                animation: 300,
                group: 'table',
                ghostClass: 'tableGhost'
            }
        }
    },
    mounted() {
        this.sections = JSON.parse(JSON.stringify(this.tabs));
        this.tabs = JSON.parse(JSON.stringify(this.sections[0].item));
    },
    methods: {
        viewSection(section, index) {
            this.currentSection = index;
            this.tabs = section.item;
        },
        editTable(table) {
            console.log(table);
            new Promise((resolve, reject) => {
                this.componentData = { table, resolve, reject }
                this.component = "tableEditor";
            }).then((resolve) => {
                console.log(resolve);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        sortSection() {

        },
        sortTable() {
            let tabs = this.tabs.map((table, index) => {
                return {
                    _id: table._id,
                    grid: index
                }
            }).filter(table => table._id);
            console.log(tabs)
        }
    },
    computed: {
        ...mapGetters(['tables', 'language'])
    }
}
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
}

.section {
    display: flex;
    flex-direction: column;
    background: #ECEFF1;
    padding: 0 2px;
    margin-top: 1px;
    height: 100%;
}

.section .btn {
    margin: 3px;
    width: 100px;
}

section.tables {
    width: 616px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.table {
    justify-content: center;
    align-items: center;
    height: 90px;
    display: flex;
    flex-direction: column;
    width: 87px;
}

.table .icon {
    font-size: 4em;
}

.sectionGhost {
    opacity: 0.5;
}

.tableGhost {
    opacity: 0.5;
    background: #03A9F4;
    color: #FAFAFA;
}
</style>