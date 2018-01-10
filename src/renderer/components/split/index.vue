<template>
    <div class="popupMask dark center">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.split')}}</h3>
            </header>
        </div>
        <div class="wrap">

        </div>
        <footer>
            <button class="btn">{{$t('button.confirm')}}</button>
        </footer>
    </div>
</template>

<script>
export default{
    props:["init"],
    data(){
        return{
            
        }
    }
}
</script>