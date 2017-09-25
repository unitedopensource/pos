<template>
    <li class="item" @click="focus(item,$event)">
        <div class="main">
            <span class="qty">{{item.qty}}</span>
            <div class="wrap">
                <div class="itemWrap">
                    <span class="name">{{item[language]}}</span>
                    <span class="mark">{{item.mark[0] | mark}}</span>
                </div>
                <div class="sideWrap">
                    <span class="side">{{item.side[language]}}</span>
                    <span class="mark">{{item.mark[1] | mark}}</span>
                </div>
            </div>
            <span class="price" @click.stop>{{item.total}}</span>
        </div>
        <div class="sub" v-for="(set,index) in item.choiceSet" @click.stop="adjustChoiceSet(set,$event)" :key="index">
            <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
            <span class="item">{{set[language]}}</span>
            <span class="price" :class="{hide:set.price == 0}">{{set.price | decimal}}</span>
        </div>
    </li>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: ['item'],
    computed: {
        ...mapGetters(['language'])
    },
    data() {
        return {

        }
    },
    methods: {
        focus(item, e) {
            if (item === this.$store.getters.item) {
                let dom = document.querySelector('li.item.active');
                dom && dom.classList.remove('active');
                this.resetPointer()
            } else {
                let dom = document.querySelector('li.item.active');
                dom && dom.classList.remove('active');
                dom = document.querySelector('.choiceSet.target');
                dom && dom.classList.remove("target");
                this.resetChoiceSet();
                e.currentTarget.classList.add("active");
                this.setPointer(item);
            }

        },
        ...mapActions(['setPointer', 'resetPointer', 'resetChoiceSet', 'setChoiceSetTarget'])
    },
    filters: {
        mark(text) {
            return text.join(" ")
        }
    }
}
</script>

<style scoped>
li {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #ddd;
    background: #fff;
    padding: 10px 5px;
}

.main {
    display: flex;
    position: relative;
}


.main .qty {
    width: 30px;
    text-align: center;
}

.main .wrap {
    flex: 1;
    display: flex;
    max-width: 215px;
    margin-right: 40px;
}

.main .price {
    position: absolute;
    right: -5px;
    padding: 10px;
    top: -10px;
}

.itemWrap {
    white-space: nowrap;
    position: relative;
}

.mark {
    position: absolute;
    top: -10px;
    left: 0;
    width: 100%;
    text-align: center;
    color: #F44336;
    font-size: 12px;
}

.sideWrap {
    color: #666;
    margin-left: 3px;
    position: relative;
}

.active {
    background: #A1887F;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.active .sideWrap {
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}
</style>