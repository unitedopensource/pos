<template>
    <article>
        <div class="wrap">
            <div v-for="(note,index) in notes" :key="note">
                <input type="radio" v-model="selected" name="note" :id="'note'+index">
                <label :for="'note'+index">
                    <paper :note="note"></paper>
                </label>
            </div>
        </div>
        <footer>
            <button class="btn">{{$t('button.add')}}</button>
            <button class="btn" v-show="selected">{{$t('button.edit')}}</button>
        </footer>
    </article>
</template>

<script>
import { mapGetters } from 'vuex'
import paper from './paper'
export default {
    components: { paper },
    data() {
        return {
            notes: [],
            selected: null
        }
    },
    created() {
        this.$socket.emit("[INQUIRY] CUSTOMER_NOTE", this.customer._id, notes => {
            this.notes = notes
        })
    },
    computed: {
        ...mapGetters(['customer'])
    }
}
</script>

<style scoped>
article {
    display: flex;
    flex-direction: column;
}

.wrap {
    height: 350px;
    display: flex;
    padding: 10px;
}

label {
    display: flex;
}

footer {
    background: #eee;
    border-top: 1px solid #e1e1e1;
}

footer button {
    margin: 5px;
}
</style>