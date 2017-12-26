<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.operator'}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h5>{{op.role}}</h5>
        <h3>{{operator}}</h3>
      </div>
      <nav>
        <span class="add" @click="remove">{{$t('button.remove')}}</span>
      </nav>
    </header>
    <toggle v-model="op.timecard" title="text.timecard" tooltip="tip.timecard"></toggle>
    <text-list v-model="op.language" title="text.defaultLanguage" :opts="languages"></text-list>
    <text-list v-model="op.cashCtrl" title="setting.cashDrawer" :opts="ctrl"></text-list>
    <external title="setting.permission.access"></external>
    <external title="setting.permission.modify"></external>
    <external title="setting.permission.view"></external>
    <toggle v-model="op.restrict" title="text.restrict" true-tooltip="tip.restrictPermission" false-tooltip="tip.temporaryPermission" :conditionalTooltip="true"></toggle>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import textList from "../common/textList";
import external from "../common/external";

export default {
  props: ["operator"],
  components: { toggle, textList, external },
  data() {
    return {
      op: {},
      componentData: null,
      component: null,
      languages: [
        {
          label: "text.english",
          tooltip: "text.primary",
          value: "usEN"
        },
        {
          label: "text.chinese",
          tooltip: "text.secondary",
          value: "zhCN"
        }
      ],
      ctrl: [
        {
          label: "text.enable",
          tooltip: "tip.cashdrawer.enable",
          value: "enable"
        },
        {
          label: "text.disable",
          tooltip: "tip.cashdrawer.disable",
          value: "disable"
        },
        {
          label: "text.staffBank",
          tooltip: "tip.cashdrawer.staffBank",
          value: "staffBank"
        }
      ]
    };
  },
  beforeRouteEnter: (to, from, next) => {
    const { operator } = to.params;
    appSocket.emit("[OPERATOR] CONFIG", operator, op =>
      next(vm => {
        vm.op = op;
      })
    );
  },
  methods: {
    remove() {}
  }
};
</script>

<style scoped>
h5 {
  color: #9e9e9e;
  font-weight: normal;
}
</style>