<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.operator.config',params:{operator:op.name}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title">
                <h5>{{$t('setting.permission.modify')}}</h5>
                <h3>{{op.name}}</h3>
            </div>
            <nav></nav>
        </header>
        <checkbox title="setting.modify.discount" v-model="op.modify" val="discount" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.price" v-model="op.modify" val="price" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.item" v-model="op.modify" val="item" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.order" v-model="op.modify" val="order" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.table" v-model="op.modify" val="table" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.driver" v-model="op.modify" val="driver" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.tip" v-model="op.modify" val="tip" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.transaction" v-model="op.modify" val="transaction" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["op"],
  components: { checkbox }
};
</script>