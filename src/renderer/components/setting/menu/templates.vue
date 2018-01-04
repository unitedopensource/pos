<template>
    <div>
        <div class="tab-content">
            <header class="nav">
                <div class="title">
                    <h5></h5>
                    <h3>{{$t("title.template")}}</h3>
                </div>
                <nav>
                    <span class="add" @click="create">{{$t('button.new')}}</span>
                </nav>
            </header>
            <external v-for="(template,index) in templates" :key="index" :title="template.alias" @open="$emit('set',template)"></external>
            <div class="pages" v-if="list.length > 12">
                <pagination :of="list" :max="5" :contain="12" @page="setPage" class="f1"></pagination>
            </div>
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
import external from "../common/external"
export default {
    components: { external },
    data() {
        return {
            list: this.$store.getters.templates,
            componentData: null,
            component: null,
            page: 0
        };
    },
    computed: {
        templates() {
            const min = this.page * 12;
            const max = min + 12;
            return this.list.slice(min, max);
        }
    },
    methods: {
        create() {

        },
        setPage(num) {
            this.page = num
        }
    }
};
</script>