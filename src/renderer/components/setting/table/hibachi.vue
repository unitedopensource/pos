<template>
    <div class="tab-content">
        <header class="nav">
            <div class="title">
                <h3>{{$t("title.hibachiTable")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <external :title="table" v-for="(table,index) in list" :key="index" @open="edit(table)"></external>
        <div class="pages" v-if="tables.length === 12">
            <pagination :of="tables" :max="5" :contain="12" @page="setPage" class="f1"></pagination>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import external from "../common/external";
import editor from "./component/hibachiEditor";

export default {
  components: { editor, external },
  computed: {
    list() {
      const min = this.page * 12;
      const max = this.page + 12;
      return this.tables.slice(min, max);
    }
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[HIBACHI] GROUP", data => {
      next(vm => {
        vm.tables = data;
      });
    });
  },
  data() {
    return {
      componentData: null,
      component: null,
      tables: [],
      page: 0
    };
  },
  methods: {
    create() {},
    edit(table) {
      console.log(table);
    },
    setPage(num) {
      this.page = num;
    }
  }
};
</script>