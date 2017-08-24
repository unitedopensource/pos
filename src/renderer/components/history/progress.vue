<template>
    <div class="popupMask center dark">
        <div class="loader">
            <h3>{{$t('dialog.systemProcessing')}}</h3>
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init']
}
</script>

<style scoped>
.loader {
    width: 300px;
    padding: 15px;
    background: #fff;
    border-radius: 6px;
    text-align: center;
}

.spinner {
    margin: 25px auto;
    width: 70px;
    text-align: center;
}

.spinner>div {
    width: 18px;
    height: 18px;
    background-color: #333;
    border-radius: 100%;
    display: inline-block;
    animation: bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
    animation-delay: -0.32s;
}

.spinner .bounce2 {
    animation-delay: -0.16s;
}

@keyframes bouncedelay {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1.0);
    }
}
</style>