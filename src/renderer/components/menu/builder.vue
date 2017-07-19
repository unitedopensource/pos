<template>
  <div class="popupMask center dark" @click.self="init.reject(true)">
    <div class="window">
      <header class="title">
        <span>{{text('ITEM_BUILDER')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="indicator">
          <div class="step" v-for="(step,index) in template.contain" @click="jumpStep(index)" :key="index">
            <span class="name">{{step.name}}</span>
            <span></span>
          </div>
        </div>
        <div class="content">
          <form>
            <fieldset>
              <legend>{{content.name}}
                <span class="limit">{{maxItem}}</span>
              </legend>
              <div class="wrap">
                <label v-for="(item,index) in content.contain" :key="index">
                  <input type="checkbox" :id="'option'+index" :value="index" v-model="selected" @change="onChange">
                  <label class="item" :for="'option'+index">{{item[language]}}</label>
                  <span class="price" v-show="item.price">{{item.price | decimal}}</span>
                </label>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <footer>
        <div class="btn" @click="init.reject">{{text('CANCEL')}}</div>
        <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['init'],
  created() {
    this.template = this.templates.find(each => each.template === this.init.side.template);
    if (!this.template) { }
    this.content = this.template.contain[0];
    this.content.max = this.init.side.max ? this.init.side.max : this.content.max || 0;
    this.template.contain.forEach(obj => {
      this.option[obj.name] = [];
    })
  },
  mounted() {
    document.querySelector('.step').classList.add("active")
  },
  data() {
    return {
      template: [],
      content: {},
      option: {},
      selected: [],
      step: 0
    }
  },
  methods: {
    jumpStep(index) {
      this.step = index;
      this.content = this.template.contain[index];
      this.selected = [];
      let target = this.content.name;

      this.option[target].map((item, index) => {
        for (let i = 0; i < this.content.contain.length; i++) {
          let obj = this.content.contain[i];
          if(item.key === obj.key){
           this.selected.push(i);
           break; 
          }
        }
      })
    },
    onChange() {
      let target = this.content.name;
      let max = this.content.max;
      let length = this.selected.length;
      let options = [];
      console.log(this.selected);
      (max > 0 ) && this.selected.splice(0, max);
      this.selected.forEach(index => {
        let item = Object.assign({},this.content.contain[index]);
        options.push(item);
      });
      if(this.content.hasOwnProperty('addition') && isNumber(this.content.addition)){
        let p = this.content.startAt - 1;
        options = options.map((item,index)=>{
          console.log(item.price)
          index >= p && (item.price = parseFloat(item.price) + parseFloat(this.content.addition));
          return item
        })
      }
      this.option[target] = options;
    },
    confirm() {
      this.init.resolve(this.option);
    }
  },
  computed: {
    maxItem() {
      return this.template.contain[this.step].max ?
        this.text('SELECT_QTY', this.template.contain[this.step].max) : this.text("ANY_QTY");
    },
    ...mapGetters(['templates', 'language'])
  },
  watch: {
    step(n) {
      let dom = document.querySelector('.step.active');
      dom && dom.classList.remove("active");
      document.querySelectorAll('.step')[n].classList.add("active");
    }
  }
}
</script>

<style scoped>
.inner {
  display: flex;
  flex-direction: row;
  min-height: 400px;
}

.indicator {
  min-width: 140px;
  border-right: 1px solid #ddd;
  background: #FAFAFA;
  padding: 10px 0 10px 20px;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 5px 10px;
  width: 412px;
}

.step {
  position: relative;
  cursor: pointer;
  flex: 1;
  color: #bdbdbd;
  transition: color 0.3s linear;
  padding-top:15px;
}

.step:before {
  font-family: fontAwesome;
  content: "\f10c";
  position: absolute;
  z-index: 1;
  background: #fafafa;
}

.step.active:before {
  content: '\f111'
}

.step:after {
  content: ' ';
  width: 2px;
  background: #ddd;
  height: 100%;
  position: absolute;
  left: 5px;
  top: 23px;
  z-index: 0;
}

.step .name {
  padding-left: 25px;
}

.step:last-child:after {
  content: none;
}

fieldset {
  padding: 0.5em 1em 1em;
  border: 1px solid #E0E0E0;
  background: #fcfcfc;
  border-radius: 4px;
}

.limit {
  font-weight: lighter;
  margin: 0 5px;
  color: #FF9800;
  font-size: 14px;
}

input[type="checkbox"] {
  display: none;
}

.wrap {
  display: flex;
  flex-wrap: wrap;
}

label.item {
  text-align: center;
  flex-wrap: wrap;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #78909C;
  margin: 1px;
  background: rgba(166, 195, 201, 0.55);
  vertical-align: top;
  width: 122px;
  height: 64px;
  transition: background 0.3s linear;
}

.wrap>label {
  display: inline-flex;
  position: relative;
}

legend {
  font-weight: bold;
  padding: 0 5px;
  font-size: 20px;
  color: #333;
}

input[type="checkbox"]:checked+label {
  background: #92aaaf;
}

.step.active {
  color: #2196F3;
}

footer .btn {
  flex: 1;
  margin: 4px;
}

.price {
  position: absolute;
  top: 2px;
  right: 2px;
  text-align: center;
  background: #607D8B;
  color: #fff;
  padding: 0 1px 0 4px;
  border-bottom-left-radius: 6px;
}
</style>
