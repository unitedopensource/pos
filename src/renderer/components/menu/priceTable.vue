<template>
    <div class="popupMask center dark">
        <div class="window">
            <header class="title">
                <span>{{$t('type.BUFFET')}}</span>
                <i class="fa fa-times" @click.self="init.reject(false)"></i>
            </header>
            <div class="inner"></div>
            <footer>
                <div class="btn f1">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props:['init'],
    data(){
        return{
            today:today()
        }
    },
    created(){
        this.getCurrentPrice();
    },
    methods:{
        getCurrentPrice(){
            
        }
    }

}
</script>

<style scoped></style>