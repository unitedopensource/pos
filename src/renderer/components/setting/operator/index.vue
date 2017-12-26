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
                <i class="fa fa-caret-right" @click="$emit('set',op.name)"></i>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      componentData: null,
      component: null,
      operators: []
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
        vm.operators = data.sort(
          (a, b) => (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1)
        );
      });
    });
  },
  methods: {
    create() {}
  }
};
</script>

<style scoped>
li {
  display: flex;
  height: 41px;
  align-items: center;
  padding: 0 0 0 20px;
  border-bottom: 1px solid #eee;
}

.name {
  font-weight: bold;
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
</style>