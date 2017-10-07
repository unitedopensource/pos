<template>
    <li class="item" @click="select(item,$event)">
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
            <span class="price" @click.stop>{{item.total | decimal}}</span>
        </div>
        <div class="sub" v-for="(set,index) in item.choiceSet" :key="index" @click.stop="adjustChoiceSet(set,$event)">
            <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
            <span class="item">{{set[language]}}</span>
            <span class="price" :class="{hide:parseFloat(set.price) === 0}" @click.stop>({{set.price | decimal}})</span>
        </div>
    </li>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: ['item'],
    computed: {
        ...mapGetters(['language', 'choiceSet'])
    },
    methods: {
        select(item, e) {
            this.$route.name === 'Menu' && this.focus(item, e);
        },
        focus(item, e) {
            if (item === this.$store.getters.item && item !== this.$store.getters.order.content.last()) {
                console.log('yes trigger')
                let dom = document.querySelector('li.item.active');
                dom && dom.classList.remove('active');
                this.resetPointer()
            } else {
                console.log('no trigger')
                let dom = document.querySelector('li.item.active');
                dom && dom.classList.remove('active');
                dom = document.querySelector('.choiceSet.target');
                dom && dom.classList.remove("target");
                this.resetChoiceSet();
                e.currentTarget.classList.add("active");
                this.setPointer(item);
            }
        },
        adjustChoiceSet(choice, e) {
            let dom = document.querySelector('.sub.target');
            dom && dom.classList.remove("target");

            if (this.choiceSet === choice) {
                this.setChoiceSetTarget(null);
            } else {
                e.currentTarget.classList.add("target");
                this.setChoiceSetTarget(choice);
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

.main,
.sub {
    display: flex;
    position: relative;
}


.qty {
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
    right: -10px;
    padding: 10px 10px 10px 20px;
    top: -10px;
}

.itemWrap {
    /* white-space: nowrap; */
    position: relative;
}

.sub .item {
    color: #666;
    text-indent: 8px;
}

.sub.target {
    background: #BCAAA4;
    border-radius: 2px;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.sub.target .item {
    color: #fff;
}

.active .sub .item {
    color: #fff;
}

.sub .price {
    min-width: 35px;
    padding-left: 4px;
    color: darkgray;
}

.active .price,
.target .price {
    color: #fff;
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

.item.print .price {
    visibility: hidden;
}

.item.print:after {
    content: '\f256';
    font-family: fontAwesome;
    position: absolute;
    right: 10px;
    color: #FF9800;
}

.item.print.pending:after {
    content: '\f02f'
}

.item.print.pending {
    background: #ECEFF1;
    border-bottom: 1px dashed #ddd;
}

.hide {
    visibility: hidden;
}
</style>