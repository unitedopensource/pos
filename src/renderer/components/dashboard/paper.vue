<template>
    <div class="paper">
        <div class="wrap">
            <span>{{note.name}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['note'],
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.paper {
    margin: 5px;
    padding: 5px;
    width: 170px;
    position: relative;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    border-radius: 4px;
    border-left: 4px solid transparent;
    transition: border 0.22s ease;
}
.paper .wrap {
    font-weight: bold;
    color: #666;
}

input[type='radio']:checked+label >div {
    border-left: 4px solid #009688;
}

</style>