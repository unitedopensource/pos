<template>
    <div class="layout">
        <draggable v-model="categories" @sort="sortCategory" :options="{animation: 300,group: 'category',ghostClass: 'categoryGhost'}">
            <transition-group tag="section" class="category">
                <div v-for="(category,index) in categories" @click="setCategory(index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
            </transition-group>
            </section>
        </draggable>
        <div>
            <div v-for="(group,groupIndex) in items" :key="groupIndex">
                <draggable :list="group" @sort="sortItem" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
                    <transition-group tag="section" class="items" :name="'drag'">
                        <div v-for="(item,index) in group" @contextmenu="editItem(item,groupIndex,index)" :class="{draggable:item.clickable,disable:!item.clickable}" :key="index" :data-menuid="item.menuID">{{item[language]}}</div>
                    </transition-group>
                </draggable>
            </div>
        </div>
        <aside>
            <div>
                <div class="btn" @click="updateItemSort" v-if="isItemSorted">{{$t('button.update')}}</div>
                <div class="btn" @click="updateCategorySort" v-if="isCategorySorted">{{$t('button.update')}}</div>
            </div>
        </aside>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import Preset from "../../../preset";
import draggable from "vuedraggable";
import dialoger from "../../common/dialoger";
import itemEditor from "./component/itemEditor";
import categoryEditor from "./component/categoryEditor";
export default {
  components: { dialoger, draggable, itemEditor, categoryEditor },
  data() {
    return {
      componentData: null,
      component: null,
      language: this.$store.getters.language,
      categories: JSON.parse(JSON.stringify(this.$store.getters.menu)),
      items: [],
      isItemSorted: false,
      isCategorySorted: false,
      categoryIndex: 0
    };
  },
  created() {
    this.getItems();
  },
  mounted() {
    document.querySelector(".category div").classList.add("active");
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    entry(e) {},
    setCategory(index) {
      this.checkItemSort()
        .then(this.getItems.bind(null, index))
        .catch(this.askSortItem.bind(null, index));
    },
    getItems(index = 0) {
      this.categoryIndex = index;
      this.items = this.categories[index].item.slice();
    },
    editCategory(category, index) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[CATEGORY] LIST", categories => {
          this.componentData = { resolve, reject, categories, category };
          this.component = "categoryEditor";
        });
      })
        .then(_category => {
          this.$socket.emit(
            "[CATEGORY] UPDATE",
            { category: _category, index },
            () => this.refreshData
          );
        })
        .catch(() => this.$q());
    },
    editItem(item, group, index) {
      let categories = this.categories[
        this.categoryIndex
      ].contain.map(category => ({
        label: category,
        tooltip: "",
        plainText: true,
        value: category
      }));

      if (!item.clickable) item = this.copyLastItem(group, index);

      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          categories,
          item,
          edit: !!item._id
        };
        this.component = "itemEditor";
      })
        .then(_item => {
          let sequence = [this.categoryIndex, group, index];
          this.$socket.emit(
            "[MENU] UPDATE",
            {
              item: _item,
              sequence
            },
            () => this.refreshData
          );
        })
        .catch(del => {
          del ? this.deleteItemConfirm(item, group, index) : this.$q();
        });
    },
    deleteItemConfirm(item, group, index) {
      this.$dialog({
        title: "dialog.deleteItem",
        msg: ["dialog.deleteItemConfirm", item[language]],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.delete", fn: "resolve" }
        ]
      })
        .then(() => {
          let sequence = [this.categoryIndex, group, index];

          this.$socket.emit(
            "[MENU] REMOVE",
            {
              _id: item._id,
              sequence
            },
            () => this.refreshData
          );
        })
        .catch(() => this.$q());
    },
    copyLastItem(group, index) {
      let item;
      let lastItem = this.items[group][index - 1];
      if (lastItem && lastItem.clickable) {
        item = JSON.parse(JSON.stringify(lastItem));
        Object.assign(item, {
          _id: undefined,
          menuID: "",
          usEN: "",
          zhCN: "",
          spicy: "",
          num: this.items[group].filter(i => i.clickable).length,
          prices: {}
        });
      } else {
        let taxClass = Object.keys(this.$store.getters.tax.class);
        let defaultTax = "";
        taxClass.forEach(name => {
          this.$store.getters.tax.class[name].default === true &&
            (defaultTax = name);
        });

        item = Preset.item();
        let category = this.categories[this.categoryIndex].contain[group];
        Object.assign(item, {
          taxClass: defaultTax,
          category
        });
      }
      return item;
    },
    sortCategory() {},
    sortItem() {
      this.isItemSorted = true;
    },
    checkItemSort() {
      return new Promise((resolve, reject) => {
        this.isItemSorted ? reject() : resolve();
      });
    },
    askSortItem(index) {
      let data = {
        title: "dialog.itemSorted",
        msg: "dialog.updateSortedItem",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.update", fn: "resolve" }
        ]
      };

      this.$dialog(data)
        .then(() => {
          this.updateItemSort();
          this.getItems(index);
          this.$q();
        })
        .catch(() => {
          this.isItemSorted = false;
          this.getItems(index);
          this.$q();
        });
    },
    updateCategorySort() {},
    updateItemSort() {},
    refreshData() {
      this.$nextTick(() => {
        this.categories = JSON.parse(JSON.stringify(this.$store.getters.menu));
        this.getItems(this.categoryIndex);
        this.$q();
      });
    }
  },
  watch: {
    categoryIndex(n) {
      let dom = document.querySelector(".category .active");
      dom && dom.classList.remove("active");

      document.querySelectorAll(".category div")[n].classList.add("active");
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  overflow-y: auto;
}

.category {
  width: 284px;
  flex: none;
}

.items {
  width: 410px;
  flex: none;
}

.categoryGhost {
  background: rgba(33, 150, 243, 0.5);
  border: 1px dashed #607d8b;
}
</style>