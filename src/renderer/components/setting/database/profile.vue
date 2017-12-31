<template>
    <div>
        <header class="nav">
            <div class="back" @click="$router.push({ name: 'Setting.database.customer' })">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">
                <h5>{{profile.name}}</h5>
                <h3>{{profile.phone | phone}}</h3>
            </div>
            <nav>
                <span class="add" @click="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
        <div>
            <text-input title="text.address" v-model="profile.address"></text-input>
            <text-input title="text.city" v-model="profile.city"></text-input>
            <text-input title="text.extension" v-model="profile.extension"></text-input>
            <text-input title="text.name" v-model="profile.name"></text-input>
            <text-input title="text.dob" v-model="profile.dob" placeholder="MM-DD"></text-input>
            <text-input title="text.email" v-model="profile.email"></text-input>
            <external title="text.viewTag"></external>
            <external title="text.viewFavoriteItem"></external>
            <external title="text.viewProfile"></external>
        </div>
    </div>
</template>

<script>
import external from "../common/external";
import textInput from "../common/textInput";
export default {
    props: ["profile"],
    components: { external, textInput },
    methods: {
        remove() {

        }
    }
}
</script>