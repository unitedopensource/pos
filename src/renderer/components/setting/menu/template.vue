<template>
    <div>
        <ul class="tabs">
            <li class="router-link-exact-active">{{$t('title.template')}}</li>
        </ul>
        <div class="tab-content">
            <header class="nav">
                <div class="title">
                    <h5></h5>
                    <h3>{{$t("title.terminalDevice")}}</h3>
                </div>
                <nav>
                    <span class="add" @click="create">{{$t('button.new')}}</span>
                </nav>
            </header>
            <table class="setting">
                <thead>
                <tr>
                    <th>{{$t('thead.name')}}</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(template,index) in templates" :key="index">
                    <td>{{template.template}}</td>
                    <td class="opt" @click="edit(template,index)">
                    <i class="fa fa-ellipsis-v"></i>
                    </td>
                </tr>
                </tbody>
            </table>
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      templates: JSON.parse(JSON.stringify(this.$store.getters.templates)),
      componentData: null,
      component: null
    };
  },
  methods: {
    edit(template, index) {}
  }
};
</script>