<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{text('TIMER')}}</span>
            </header>
            <div class="inner">
                hello
            </div>
            <footer>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    components: {},
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapGetters(['op', 'language'])
    }
}
</script>

<style></style>