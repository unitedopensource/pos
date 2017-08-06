<template>
    <div>
        <section class="card">
            <header>{{text('DISPLAY_SETTING')}}</header>
            <article>
                <smart-switch v-model="display.menuID" label="MENU_ID"></smart-switch>
                <smart-switch v-model="display.favorite" label="FAVORITE_ITEM"></smart-switch>
                <smart-switch v-model="display.voidItem" label="DISPLAY_VOID_ITEM"></smart-switch>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartSwitch from '../common/smartSwitch'
export default {
    components: { smartSwitch },
    data() {
        return {
            display: {}
        }
    },
    created() {
        this.display = JSON.parse(JSON.stringify(this.config.display));
    },
    watch: {
        display: {
            handler(n) {
                let change = false;
                Object.keys(this.display).forEach(key => {
                    if (this.display[key] !== this.config.display[key]) change = true;
                });
                change ? this.$emit("change", n) : this.$emit("unchange");
            }, deep: true

        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style></style>