<template>
    <div class="popupMask center dark">
        <div class="loader">
            <h3>{{$t('dialog.systemProcessing')}}</h3>
            <div class="wrap">
                <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
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
    background:repeating-linear-gradient(-55deg,#f44336,#f44336 20px,#e63b32 20px,#e63b32 40px);
}

.wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: auto;
}

.dots {
    height: 50px;
    width: 80px;
}

.dot {
    display: inline-block;
    background: #444;
    height: 10px;
    width: 10px;
    opacity: 0.3;
    border-radius: 50%;
    animation: moveit 0.8s infinite;
}

dot:nth-child(2) {
    animation-delay: .15s;
}

.dot:nth-child(3) {
    animation-delay: .3s;
}

.dot:nth-child(4) {
    animation-delay: .45s;
}

.dot:nth-child(5) {
    animation-delay: .6s;
}

@keyframes moveit {
    0% {
        transform: translateY(0px);
    }
    35% {
        transform: translateY(0px);
        opacity: 0.3;
    }
    50% {
        transform: translateY(-20px);
        opacity: 0.8;
    }
    70% {
        transform: translateY(3px);
        opacity: 0.8;
    }
    85% {
        transform: translateY(-3px);
    }
}
</style>