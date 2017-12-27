<template>
    <div>
        <header class="nav">
            <div class="title">
                <h5></h5>
                <h3>{{$t("title.operators")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <ul>
            <li v-for="(op,index) in operators" :key="index">
                <span class="name">{{op.name}}</span>
                <span class="role">{{op.role}}</span>
                <i class="fa fa-caret-right" @click="$emit('set',op)"></i>
            </li>
            <li class="footer" v-if="list.length > 14">
                <pagination :of="list" :max="5" :contain="14" @page="setPage" class="f1"></pagination>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import pagination from "../../common/pagination";
export default {
  components: { pagination },
  data() {
    return {
      componentData: null,
      component: null,
      list: [],
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[OPERATOR] LIST", data => {
      next(vm => {
        const sort = [
          "Owner",
          "Manager",
          "Cashier",
          "Waitstaff",
          "Bartender",
          "ThirdParty"
        ];
        vm.list = data.sort(
          (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
        );
      });
    });
  },
  computed: {
    operators() {
      const min = this.page * 14;
      const max = min + 14;
      return this.list.slice(min, max);
    }
  },
  methods: {
    create() {},
    setPage(num) {
      this.page = num;
    }
  }
};
</script>

<style scoped>
ul {
  height: 630px;
  background: #fcfcfc;
  position: relative;
}

li {
  display: flex;
  height: 41px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.name {
  font-weight: bold;
  padding-left: 20px;
}

.role {
  color: #9e9e9e;
  flex: 1;
  text-align: right;
}

i {
  padding: 10px 25px;
  margin: 0 10px;
  color: #555;
  cursor: pointer;
}

i:hover {
  background: #eee;
  border-radius: 4px;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>