<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.operator.config',params:{operator:op.name}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title">
                <h5>{{$t('setting.permission.access')}}</h5>
                <h3>{{op.name}}</h3>
            </div>
            <nav></nav>
        </header>
        <checkbox title="setting.view.summary" v-model="op.view" val="summary" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.view.invoices" v-model="op.view" val="invoices" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.view.tables" v-model="op.view" val="tables" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["op"],
  components: { checkbox }
};
</script>