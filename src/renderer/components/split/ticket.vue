<template>
    <div class="ticket">
        <ul>
            <li v-for="(item,index) in items" :key="index" :data-item="item.unique">
                <div>
                    <span class="qty">{{item.qty}}</span>
                    <div class="item">
                        <span class="name">{{item[language]}}</span>
                        <span class="option">{{item.side[language]}}</span>
                    </div>
                    <span class="price">{{item.total}}</span>
                </div>
                <div class="choice">

                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['invoice'],
    data() {
        return {
            items: []
        }
    },
    created() {
        console.log('trigger')
        this.items = this.invoice.content;
    },
    computed: {
        ...mapGetters(['language'])
    }
}
</script>

<style scoped>
.ticket {
    min-width: 240px;
    min-height: 400px;
    margin: 0 5px;
    background: #fafafa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    position: relative;
}

ul {
    display: flex;
    flex-direction: column;
}

li {
    display: flex;
    flex-direction: column;
    height: 34px;
    justify-content: center;
    background: #fff;
    border-bottom: 1px solid #ddd;
}

li div {
    display: flex;
}

.item {
    flex: 1;
}

li .qty {
    min-width: 20px;
    text-align: center;
}

.price {
    min-width: 40px;
    text-align: center;
}
</style>