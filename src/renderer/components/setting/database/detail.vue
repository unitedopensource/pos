<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{address.street}}</h3>
            </div>
            <nav>
                <span class="add" @click="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
        <div>
            <text-input v-model="address.street" title="text.street"></text-input>
            <text-input v-model="address.city" title="text.city"></text-input>
            <text-input v-model="address.zipCode" title="text.zipCode"></text-input>
            <external title="text.viewCustomer"></external>
        </div>
    </div>
</template>

<script>
import toggle from "../common/toggle"
import external from "../common/external";
import textInput from "../common/textInput";

export default {
    props: ["address"],
    components: { toggle, external, textInput },
    data() {
        return {

        }
    },
    methods: {
        remove() {

        },
        save() {
            this.$emit("reset");
            this.$router.push({ name: 'Setting.database.address' });
        }
    }
}
</script>

<style scoped>

</style>