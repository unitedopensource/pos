<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.giftCardTask')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <div>
                    <input type="radio" name="task" v-model="task" value="activation" id="activation">
                    <label for="activation">
                        <i class="fa fa-credit-card"></i>{{$t('card.activation')}}</label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="reload" id="reload">
                    <label for="reload">
                        <i class="fa fa-money"></i>{{$t('card.reload')}}</label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="view" id="history">
                    <label for="history">
                        <i class="fa fa-list-ol"></i>{{$t('card.history')}}</label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="redemption" id="redemption">
                    <label for="redemption">
                        <i class="fa fa-usd"></i>{{$t('card.redemption')}}</label>
                </div>
            </div>
            <footer>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import capture from './capture'
import dialoger from '../common/dialoger'
export default {
    props: ['init'],
    components: { capture, dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            task: 'activation',
            card: null,
        }
    },
    methods: {
        confirm() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = 'capture'
            }).then((data) => {
                this.$q()
                let { number, result } = data;
                console.log(number, result);

                switch (this.task) {
                    case "activation":
                        if (!result) {
                            this.$dialog({
                                title: 'dialog.giftCardActivation',
                                msg: 'dialog.giftCardActivationTip',
                                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirm', fn: 'resolve' }]
                            }).then(() => {

                            }).catch(() => {
                                this.$q()
                            })
                        } else {
                            this.$dialog({
                                title: 'dialog.giftCardRegistered',
                                msg: 'dialog.giftCardRegisteredInfo',
                                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                            }).then(() => {
                                this.$q()
                            })
                        }
                        break;
                    case "reload":
                        break;
                    case "view":
                        break;
                    case "redemption":
                        break;
                }

            }).catch(() => { this.$q() })

        }
    }
}
</script>

<style scoped>
label {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 25px;
    width: 250px;
    padding: 15px;
    align-items: center;
    margin: 5px;
    cursor: pointer;
    position: relative;
}

input:checked+label {
    background: #009688;
    color: #fff;
    text-shadow: 0 1px 1px #333;
}

input:checked+label:after {
    position: absolute;
    bottom: 5px;
    right: 7px;
    content: '\f058';
    font-family: fontAwesome;
    color: #fff;
}

label .fa {
    margin-right: 10px;
    width: 20px;
}
</style>