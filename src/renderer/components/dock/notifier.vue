<template>
    <div class="popupMask center dark">
        <div class="wrap">
            <i class="fa fa-warning icon"></i>
            <h3>{{$t("dialog.communicationInterrupted")}}</h3>
            <h5>{{pass}}</h5>
            <footer>
                <div>
                    <i class="fa fa-commenting"></i>{{$t('dialog.communicationInterruptedTip')}}</div>
                <span class="phone">{{$t('technicalSupportNumber')}}</span>
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
            return `${Math.floor(diff/1000/60)}:${Math.floor(diff/1000)}`
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
    font-size: 5em;
}

footer i {
    margin-right: 5px;
}

footer div,
footer span {
    background: #FF5722;
    border-radius: 14px;
    padding: 0 20px;
    margin: 5px;
}
</style>