<template>
    <div>
        <header class="nav">
            <div class="title">
                <h5></h5>
                <h3>{{$t("title.addressList")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <ul v-for="(address,index) in addresses" :key="index">
            <li>
                <div class="f1">
                    <h4>{{address.street}}</h4>
                    <h5>{{address.city}}</h5>
                </div>
                <span class="time">{{address.zipCode}}</span>
                <i class="fa fa-caret-right" @click="$emit('set',address)"></i>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialoger from "../../common/dialoger";

export default {
    props: ["addresses"],
    components: { editor, dialoger },
    data() {
        return {
            componentData: null,
            component: null,
        }
    },
    methods: {
        create() {
            this.$p("editor", { address })
        },
        edit(address) {
            this.$p("editor", { address })
        }
    }
}
</script>

<style scoped>
li {
  height: 40px;
  display: flex;
  padding-left: 20px;
  align-items: center;
  text-transform: capitalize;
  border-bottom: 1px solid #eee;
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