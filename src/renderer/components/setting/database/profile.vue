<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
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
            <div class="date">
                <p>{{$t('text.firstDate')}}</p>
                <span>{{profile.firstDate | moment('YYYY-MM-DD HH:mm:ss')}}</span>
            </div>
            <div class="date">
                <p>{{$t('text.lastDate')}}</p>
                <span>{{profile.lastDate | moment('YYYY-MM-DD HH:mm:ss')}}
                    <span class="from">({{profile.lastDate | fromNow}})</span>
                </span>
            </div>
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

        },
        save() {
            this.$emit('reset');
            this.$router.push({ name: 'Setting.database.customer' });
        }
    }
}
</script>

<style scoped>
.date {
  padding: 4px 20px 0;
  border-bottom: 1px solid #eee;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

p {
  color: #656565;
}

.from {
  margin-left: 10px;
  color: #009688;
}
</style>