<template>
    <div class="popupMask center dark">
        <div class="wrap">
            <i class="fa fa-warning icon"></i>
            <h3>{{text("COMMUNICATION_INTERRUPTED")}}</h3>
            <h5>{{pass}}</h5>
            <footer>
                <div>
                    <i class="fa fa-commenting"></i>Please CONTACT our technical support</div>
                <span class="phone">(888)299-0524</span>
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
            happened: +new Date - 1000
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