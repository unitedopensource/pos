<template>
    <div class="receipt">
        <header>
            <div class="store" :class="{hide:!receipt.store}">
                <h3>{{store.name}}</h3>
                <h5>{{store.address}}</h5>
                <h5>{{store.city}} {{store.state}} {{store.zipCode}}</h5>
                <h5>{{store.contact}}</h5>
            </div>
            <div class="type" :class="{hide:!receipt.type}">
                <p class="zhCN" :style="style.zhCN">送餐</p>
                <p class="usEN" :style="style.usEN">DELIVERY</p>
            </div>
            <div class="time">
                <span>Date: {{date}}</span>
                <span>Time: {{time}}</span>
                <div class="number">{{ticket.number}}</div>
            </div>
            <div class="server">
                <p>
                    <span class="wrap">
                        <span class="text">Cashier:</span>
                        <span class="value">{{op.name}}</span>
                    </span>
                </p>
            </div>
            <div class="customer" :class="{hide:!receipt.customer}">
                <p>
                    <span class="text">Tel:</span>
                    <span class="value" :style="style.info">888.299.0524</span>
                </p>
                <p>
                    <span class="text">Addr:</span>
                    <span class="value" :style="style.info">50 Allen St</span>
                </p>
                <p>
                    <span class="text">City:</span>
                    <span class="value">New York</span>
                </p>
                <p>
                    <span class="text">Name:</span>
                    <span class="value">United POS Inc.</span>
                </p>
            </div>
        </header>
        <section class="body">
            <p class="list" :style="style.zhCN">
                <span class="qty">2</span>
                <span class="itemWrap">
                    <span class="item">芥兰鸡
                        <span class="mark"></span>
                    </span>
                    <span class="side">[ 小 ]
                        <span class="mark"></span>
                    </span>
                </span>
                <span class="price" :class="{hide:!receipt.primaryPrice}">12.59</span>
            </p>
            <p class="list" :style="style.usEN">
                <span class="qty">2</span>
                <span class="itemWrap">
                    <span class="item">Chicken Broccoli
                        <span class="mark"></span>
                    </span>
                    <span class="side">[ Pt. ]
                        <span class="mark"></span>
                    </span>
                </span>
                <span class="price" :class="{hide:!receipt.secondaryPrice}">12.59</span>
            </p>
            <p class="list mark" :style="style.zhCN">
                <span class="qty"></span>
                <span class="itemWrap">
                    <span class="item">炸鸡翅
                        <span class="mark">SPK</span>
                    </span>
                    <span class="side">[ 薯条 ]
                        <span class="mark">K</span>
                    </span>
                </span>
                <span class="price" :class="{hide:!receipt.primaryPrice}">5.99</span>
            </p>
            <p class="list mark" :style="style.usEN">
                <span class="qty"></span>
                <span class="itemWrap">
                    <span class="item">Fried Chicken Wing
                        <span class="mark">SPK</span>
                    </span>
                    <span class="side">[ F.F. ]
                        <span class="mark">K</span>
                    </span>
                </span>
                <span class="price" :class="{hide:!receipt.secondaryPrice}">5.99</span>
            </p>
        </section>
        <div class="payment" :class="{hide:!receipt.payment}">
            <p>
                <span class="text">Subtotal:</span>
                <span class="value">18.58</span>
            </p>
            <p>
                <span class="text">Tax:</span>
                <span class="value">1.63</span>
            </p>
            <p class="bold">
                <span class="text">TOTAL:</span>
                <span class="value">20.21</span>
            </p>
        </div>
        <div class="footer">
            Thank You Very Much
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.receipt header {
    text-align: center;
    font-family: 'Agency FB';
}

.receipt h3 {
    font-size: 22px;
    font-weight: bold;
}

.receipt h5 {
    font-size: 16px;
    font-weight: lighter;
}

.receipt .type {
    margin: 12px;
}

.receipt .type p {
    justify-content: center;
    align-content: center;
}

.receipt .time {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #9E9E9E;
    position: relative;
}

.receipt .time span {
    margin: 0 10px;
}

.receipt .time .number {
    position: absolute;
    right: 10px;
    bottom: 12px;
    font-size: 2em;
    font-weight: bold;
}

.server p {
    text-align: left;
    padding: 0 10px;
    border-bottom: 1px solid gray;
}

.receipt .customer {
    text-align: left;
    padding: 2px 10px;
    border-bottom: 1px solid gray;
}

.receipt .customer .text {
    display: inline-block;
    width: 40px;
}

p.list {
    display: flex;
}

p.list .qty {
    width: 35px;
    text-align: center;
}

section.body {
    padding: 10px 10px 15px 0;
}

p.mark {
    margin-top: 10px;
}

.itemWrap .mark {
    position: absolute;
    left: 0;
    right: 0;
    top: -11px;
    text-align: center;
    font-size: 12px;
}

.itemWrap>span {
    position: relative;
}

.price {
    flex: 1;
    text-align: right;
}

.payment {
    font-family: 'Agency FB';
    text-align: right;
    padding: 0 10px;
}

.payment .value {
    display: inline-block;
    width: 40px;
}

.payment .bold {
    font-weight: bolder;
    font-size: 1.25em;
}

.footer {
    text-align: center;
    border-top: 1px solid gray;
    margin-top: 10px;
    padding-top: 5px;
}

.hide {
    display: none;
}
</style>