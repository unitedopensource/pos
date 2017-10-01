<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('card.realoder')}}</span>
            </header>
            <div class="inner">

            </div>
            <footer>
                <div class="btn">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {

        }
    },
    methods:{

    }
}
</script>