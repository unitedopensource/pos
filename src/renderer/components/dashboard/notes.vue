<template>
    <article>
        <div class="wrap" @click.self="selected = null">
            <div v-for="(note,index) in notes" :key="note">
                <input type="radio" v-model="selected" name="note" :id="'note'+index" :value="index">
                <paper :note="note" :index="index"></paper>
            </div>
        </div>
        <footer>
            <div class="f1">
                <button class="btn" @click="newNote" :disabled="notes.length > 9">{{$t('button.new')}}</button>
                <button class="btn" v-show="selected != null" @click="edit">{{$t('button.edit')}}</button>
                <button class="btn" v-show="selected != null" @click="remove">{{$t('button.remove')}}</button>
            </div>
            <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
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
        this.$socket.emit("[NOTE] GET_NOTE", this.customer._id, notes => {
            this.notes = notes
        })
    },
    methods: {
        newNote() {

        },
        edit() {

        },
        remove() {
            let note = this.notes[this.selected];
            this.$socket.emit("[NOTE] REMOVE_NOTE", note._id);
            this.notes.splice(this.selected, 1)
            this.selected = null;
        },
        confirm() {
            isNumber(this.selected) && Object.assign(this.order, {
                carryNote: this.notes[this.selected]
            })
            this.$router.push({ path: '/main/menu' });
        }
    },
    computed: {
        ...mapGetters(['customer', 'order'])
    }
}
</script>

<style scoped>
article {
    display: flex;
    flex-direction: column;
}

.wrap {
    height: 250px;
    display: flex;
    padding: 10px;
    align-items: flex-start;
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

input[type='radio']:checked+label {
    border-left: 4px solid #009688;
    color: #333;
    font-weight: bold;
}

input[type='radio']:checked+label:after {
    position: absolute;
    font-family: fontAwesome;
    content: '\f058';
    color: #009688;
    bottom: 5px;
    right: 5px;
}
</style>