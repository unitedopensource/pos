<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{template.alias}}</h3>
            </div>
            <nav>
                <span @click="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
    </div>
</template>

<script>
export default {
    props: ["template"],
    data() {
        return {

        }
    },
    methods: {
        save() {



            this.$emit("reset");
        },
        remove(){

        }
    }
}
</script>

<style scoped>

</style>