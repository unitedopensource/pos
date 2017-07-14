<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">{{text('GIFT_CARD')}}</header>
            <div class="inner">
                <div class="selector" v-show="!component">
                    <div class="job">
                        <i class="fa fa-3x fa-credit-card"></i>
                        <span>{{text('ACTIVATION')}}</span>
                    </div>
                    <div class="job" @click="captureCard">
                        <i class="fa fa-3x fa-credit-card-alt"></i>
                        <span>{{text('SWIPE')}}</span>
                    </div>
                </div>
                <div :is="component" :init="componentData"></div>
            </div>
            <footer>
                <div class="btn" @click="init.reject">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import capture from './capture'
export default {
    components: { capture },
    props: ['init'],
    data() {
        return {
            component: null,
            componentData: null
        }
    },
    methods: {
        captureCard() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = 'capture';
            }).then((capture)=>{

            }).catch(()=>{

            })

        }
    }
}
</script>

<style scoped>
.window {
    width: 950px;
    height: 650px;
    display: flex;
    flex-direction: column;
}

.title {
    padding: 13px 27px;
}

.title i {
    padding: 16px 25px;
}

.inner {
    flex: 1;
}

.selector {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.job {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 200px;
    margin: 15px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
}

.job:active {
    background: #eee;
}

.job span {
    margin-top: 2em;
}

.btn {
    margin: 5px;
    font-size: 1em;
}
</style>