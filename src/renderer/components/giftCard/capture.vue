<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="capture">
            <i class="fa info loader"></i>
            <h3>{{message}}</h3>
            <footer>
                <button class="btn" @click="manual">{{$t('text.manualInput')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default{
    props:["init"],
    data(){
        return{
            message:""
        }
    },
    methods:{
        manual(){
            
        }
    }
}
</script>