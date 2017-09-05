<template>
    <div class="popupMask center dark">
        <div class="window">
            <header class="title">
                <span>{{$t('text.selectPaymentType')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <div v-for="(type,index) in options" :key="index">
                    <input type="radio" name="type" v-model="payment" :value="type">
                    <label>{{type}}</label>
                </div>
            </div>
            <footer>
                <div class="button">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props:['init'],
    data(){
        return{
            options:[],
            payment:null
        }
    }

}
</script>

<style>

</style>