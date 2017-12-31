<template>
    <div>
        <header class="nav">
            <div class="title">
                <h5></h5>
                <h3>{{$t("title.customer")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <ul v-for="(customer,index) in customers" :key="index">
            <li>
                <div class="f1">
                    <h4>{{customer.phone | phone}}</h4>
                    <h5>{{customer.address}}
                        <span class="city" v-show="customer.city">, {{customer.city}}</span>
                    </h5>
                </div>
                <span class="time">{{customer.lastDate | fromNow}}</span>
                <i class="fa fa-caret-right"></i>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import Preset from "../../../preset";
import editor from "./component/customerEditor";

export default {
    props: ["customers"],
    components: { editor },
    data() {
        return {
            componentData: null,
            component: null,
        }
    },
    methods: {
        create() {
            const customer = Preset.customer();
            this.$p("editor", { customer })
        }
    }
}
</script>

<style scoped>
li {
  padding-left: 20px;
  height: 40px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

h5 {
  font-weight: normal;
  color: #656565;
}

i {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
  border-radius: 4px;
}

i:hover {
  background: #eee;
}

.time {
  font-size: 14px;
  color: #9e9e9e;
}
</style>