<template>
    <div class="popupMask center dark">
        <div class="wrap">
            <i class="fa fa-warning icon"></i>
            <h3>{{$t("dialog.communicationInterrupted")}}</h3>
            <h5>
                <span>{{pass.minute}}</span>
                <span>:</span>
                <span>{{pass.second}}</span>
            </h5>
            <footer>
                <div>
                    <i class="fa fa-commenting"></i>{{$t('dialog.communicationInterruptedTip')}}</div>
                <span class="phone">{{$t('dialog.technicalSupportNumber')}}</span>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            happened: +new Date() - 1000
        }
    },
    computed: {
        pass() {
            let diff = this.time - this.happened;
            let minute = Math.floor(diff / 1000 / 60);
            let second = Math.floor(diff / 1000 % 60);
            return {
                minute: ("0" + minute).slice(-2),
                second: ("0" + second).slice(-2)
            }
        },
        ...mapGetters(['time'])
    }
}
</script>

<style scoped>
.wrap {
    text-align: center;
    color: #fff;
}

.icon {
    color: #E53935;
    text-shadow: 0 1px 3px #920707;
    font-size: 5em;
}

footer i {
    margin-right: 5px;
}

footer div,
footer span {
    background: #FF5722;
    border-radius: 4px;
    padding: 1px 20px;
    margin: 5px;
    text-shadow: 0 1px 1px #333;
}
</style>