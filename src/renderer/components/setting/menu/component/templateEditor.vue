<template>
    <div class="popupMask setting center dark">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.template')}}</h3>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props:["init"],
    data(){
        return{

        }
    },
    methods:{

    }
};
</script>

<style scoped>

</style>