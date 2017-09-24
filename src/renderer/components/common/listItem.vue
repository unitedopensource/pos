<template>
    <li>
        <div class="main">
            <span class="qty">{{item.qty}}</span>
            <div class="item">
                <div class="itemWrap">
                    <span class="name">{{item[language]}}</span>
                    <span class="mark">{{item.mark[0] | mark}}</span>
                </div>
                <div class="sideWrap">
                    <span class="side">{{item.side[language]}}</span>
                    <span class="mark">{{item.mark[1] | mark}}</span>
                </div>
            </div>
            <span class="price">{{item.total}}</span>
        </div>
        <div class="sub" v-for="(set,index) in item.choiceSet" @click.stop="adjustChoiceSet(set,$event)" :key="index">
            <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
            <span class="item">{{set[language]}}</span>
            <span class="price" :class="{hide:set.price == 0}">{{set.price | decimal}}</span>
        </div>
    </li>
</template>

<script>
export default {
    props: ['item']
}
</script>