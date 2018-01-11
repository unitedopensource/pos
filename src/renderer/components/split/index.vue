<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.split')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <div class="view">
                    <div class="scroll">
                        <ticket v-for="(order,index) in splits" :key="index" :index="index" :data="order" @acquire="transfer" @destroy="remove" :master="false"></ticket>
                    </div>
                </div>
                <div class="more" @click="create">
                    <div>
                        <i class="fa fa-3x fa-plus"></i>
                    </div>
                </div>
                <ticket :data="order" :master="true" @acquire="restore"></ticket>
            </div>
            <footer>
                <div class="opt">

                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import ticket from "./ticket";
export default {
  props: ["init"],
  components: { ticket },
  data() {
    return {
      order: JSON.parse(JSON.stringify(this.$store.getters.order)),
      splits: []
    };
  },
  created() {
    this.order.splits && this.getSplitOrder();
  },
  methods: {
    getSplitOrder() {
      this.$socket.emit("[SPLIT] GET", this.order.splits, splits => {
        this.splits = splits;
      });
    },
    create() {
      const _id = ObjectId();
      let content = [];

      this.$children.map(vm => content.push(...vm.buffer));
      const split = Object.assign({}, this.order, { _id, content });
      this.splits.push(split);
      this.$bus.emit("reset");
    },
    transfer({ unique, index }) {
      let buffer = [];
      this.$children.map(vm =>
        vm.buffer.forEach(item => buffer.push(JSON.parse(JSON.stringify(item))))
      );
      this.$bus.emit("transfer", {
        unique,
        items: buffer
      });
    },
    restore() {
      let buffer = [];
      this.$children.map(vm => vm.buffer.forEach(item => buffer.push(item)));
      let items = buffer.filter(item => item.parent).map(item => item.parent);
      this.$bus.emit("restore", items);
    },
    remove(index){
        this.splits.splice(index,1);
        console.log(this.splits)
    },
    confirm() {}
  }
};
</script>

<style scoped>
.editor {
  width: 1000px;
}

.wrap {
  display: flex;
  min-height: 500px;
  padding: initial;
  background: url(../../assets/image/grid.png) #fcfcfc;
}

.view {
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  width: 618px;
  overflow: hidden;
}

.view .scroll {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-width: 1000px;
}

.more {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #eee;
  background: #fff;
  border-radius: 4px;
  width: 110px;
  margin: 4px;
  color: #757575;
  cursor: pointer;
}
</style>