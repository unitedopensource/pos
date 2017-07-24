<template>
    <div class="layout">
        <draggable v-model="sections" @sort="sortSection" :options="{animation: 300,group: 'section',ghostClass: 'sectionGhost',draggable:'.draggable'}">
            <transition-group tag="section" class="section">
                <div class="btn draggable" v-for="(section,index) in sections" @click="viewSection(section)" @contextmenu="editSection(section,index)" :key="index">{{section[language]}}</div>
            </transition-group>
        </draggable>
        <draggable v-model="tabs" @sort="sortTable" :options="{animation: 300,group: 'table',ghostClass: 'tableGhost'}" class="f1">
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
import dialoger from '../../common/dialoger'
export default {
    components: {
        draggable, dialoger
    },
    data() {
        return {
            tabs: [],
            sections: [],
            currentSection: 0,
            component: null,
            componentData: null
        }
    },
    created() {
        this.sections = JSON.parse(JSON.stringify(this.tables));
        this.tabs = JSON.parse(JSON.stringify(this.sections[0].item));
    },
    methods: {
        viewSection(section, index) {
            this.currentSection = index;
            this.tabs = section.item;
        },
        editSection(section, index) {

        },
        editTable() {
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
            console.log(this.sections)
        },
        sortTable() {
            console.log(this.tabs)
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
}

section.section {
    margin: 5px;
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
</style>