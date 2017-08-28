<template>
    <div class="popupMask center dark">
        <div class="window">
            <header class="title">
                <span>{{$t('reservation.create')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <section class="source" v-if="step === 0">
                    <div @click="setSource('walkIn')">
                        <i class="fa fa-3x fa-user"></i>
                        <span class="text">{{$t('reservation.walkIn')}}</span>
                    </div>
                    <div @click="setSource('phone')">
                        <i class="fa fa-3x fa-phone"></i>
                        <span class="text">{{$t('reservation.phone')}}</span>
                    </div>
                </section>
                <section class="" v-if="step === 1">
                    <article v-if="book.type ==='walkIn'">
                        <div class="content">
                            <div class="input">
                                <div>
                                    <label>{{$t('reservation.name')}}</label>
                                    <div>
                                        <input type="text" v-model="book.name">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('text.phone')}}</label>
                                    <div>
                                        <input type="text" v-model="book.phone">
                                    </div>
                                </div>
                                <div>
                                    <label>{{$t('reservation.guest')}}</label>
                                    <div>
                                        <input type="number" v-model.number="book.size">
                                    </div>
                                </div>
                            </div>
                            <aside>
                                <div class="queue">
                                    <span class="value">{{book.ticket}}</span>
                                    <span class="text">{{$t('reservation.number')}}</span>
                                </div>
                                <div></div>
                            </aside>
                        </div>

                        <footer>
                            <div class="btn" @click="placeQueue">{{$t('button.print')}}</div>
                        </footer>
                    </article>
                    <article v-if="book.type ==='phone'">
                        phone
                    </article>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            book: {
                type: '',
                name: '',
                phone: '',
                size: 1,
                ticket: 1
            },
            step: 0
        }
    },
    methods: {
        setSource(type) {
            this.step++;
            this.book.type = type;
        },
        placeQueue() {
            Object.assign(this.book, { time: +new Date() });

        }
    }
}
</script>

<style scoped>
.window {
    width: 600px;
}

section.source {
    display: flex;
    justify-content: center;
}

.source div {
    margin: 45px 30px;
    padding: 40px 70px 55px;
    border-radius: 4px;
    background: linear-gradient(#fefefe, #cfd0d3);
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.source span {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 5px 0;
}

.source div:active {
    background: linear-gradient(#E2E3E4, #AAADB4);
    color: #333;
}

article .content {
    display: flex;
    margin: 15px 0px;
}

article aside {
    flex: 1;
    border-left: 1px solid #fff;
    display: flex;
    justify-content: center;
}

.input {
    border-right: 1px solid #eee;
    padding: 0 30px;
}

.input label {
    display: block;
    color: #333;
    font-weight: bold;
    text-indent: 5px;
    margin: 0px 0 2px 0;
    position: relative;
}

.input input {
    font-size: 25px;
    padding: 2px 5px;
    border: 2px solid #e5e5e5;
    width: 200px;
}

.queue {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.queue .value {
    font-size: 7em;
    font-family: 'Agency FB';
    font-weight: bold;
}

.queue .text {
    color: #757575;
}
</style>