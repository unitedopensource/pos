<template>
    <div class="popupMask setting dark center">
        <div class="editor">
            <title>
                <h5></h5>
                <h3></h3>
            </title>
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
    }
}
</script>