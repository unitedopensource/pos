<template>
    <section>
        <label :for="id">
            {{$t(label)}}
            <transition-group name="slideUp">
                <span class="distance" v-if="distance" :key="1">{{distance}}</span>
                <span class="duration" v-if="duration" :key="2">{{duration}}</span>
            </transition-group>
        </label>
        <div class="field">
            <input type="text" :id="id" :value="value" @change="$emit('input',$event.target.value)" @click="setAnchor($event)">
            <i :class="icon"></i>
        </div>
        <dialog v-if="autoComplete">
            <div class="predict" v-for="data in autoComplete" @click="fill(data)">
                <div v-if="data.phone" class="column">
                    <div class="top">
                        <span class="phone">{{data.phone | tel}}</span>
                        <span class="time">{{data.extra.lastDate | fromNow}}</span>
                    </div>
                    <span class="address">{{data.address}}</span>
                </div>
                <div v-else class="row">
                    <span class="street">{{data.street}}</span>
                    <span class="city">{{data.city}}</span>
                </div>
            </div>
        </dialog>
    </section>
</template>

<script>
export default {
    props: ['label', 'value', 'icon', 'autoComplete', 'duration', 'distance', 'id'],
    methods: {
        setAnchor(e) {
            let dom = document.querySelector("input.active");
            dom && dom.classList.remove("active");

            e.currentTarget.classList.add("active");
            let caret = e.currentTarget.selectionStart;
            let target = e.currentTarget.id;
            this.$emit("focus", { target, caret });
        },
        fill(data) {
            this.$emit("fill", data)
        }
    }
}
</script>

<style scoped>
section {
    display: inline-flex;
    flex-direction: column;
    position: relative;
}

input.active {
    border: 2px solid #02A7F2;
}

label {
    display: block;
    color: #333;
    font-weight: bold;
    text-indent: 5px;
    margin: 5px 0 2px 0;
    position: relative;
}

.field {
    position: relative;
    z-index: 1;
}

input {
    border: 2px solid #e5e5e5;
    padding: 5px;
    font-weight: bold;
    color: #3c3c3c;
    font-size: 1.25em;
    text-indent: 5px;
    width: 186px;
    outline: none;
}

.address input {
    width: 390px;
}

.note input {
    width: 594px;
}

dialog {
    min-width: 100%;
    border: 0px;
    display: block;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
    top: 63px;
    z-index: 2;
}

.predict {
    padding: 0 5px;
}

.phone {
    min-width: 125px;
}

.predict>div {
    display: flex;
    position: relative;
    padding-left: 7px;
    border-bottom: 1px dashed #BDBDBD;
}

.column {
    flex-direction: column;
    min-height: 37px;
    padding: 5px;
}

.row {
    flex-direction: row;
    padding: 8px 5px;
}

.top {
    display: flex;
    flex-wrap: nowrap;
}

.time {
    flex: 1;
    text-align: right;
    white-space: nowrap;
    font-size: 0.8em;
    color: #455A64;
    font-family: 'Microsoft YaHei';
}

.address {
    font-weight: bold;
    color: chocolate;
    white-space: nowrap;
}

span.street {
    flex: 1;
    color: chocolate;
}

.city {
    color: #9E9E9E;
    font-weight: normal;
}

span.distance,
span.duration {
    display: inline-flex;
    margin: 0 5px;
    padding: 0 10px;
    text-indent: 0;
    color: #009688;
    background: #fff;
    border: 2px solid #e5e5e5;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border-bottom: none;
    position: absolute;
    top: 0;
}

span.duration {
    right: 28px;
}

span.distance {
    right: 115px;
}

.predict:last-child div {
    border-bottom: none;
}

.slideUp-enter-active,
.slideUp-leave-active {
    transition: transform .3s;
}

.slideUp-enter,
.slideUp-leave-active {
    transform: translate3d(0, 20px, 0);
}
</style>