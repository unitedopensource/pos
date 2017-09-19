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
                <button class="btn" @click="newNote" :disabled="notes.length >= 9" v-show="selected === null">{{$t('button.new')}}</button>
                <button class="btn" v-show="selected != null" @click="edit">{{$t('button.edit')}}</button>
                <button class="btn" v-show="selected != null" @click="remove">{{$t('button.remove')}}</button>
            </div>
            <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
        </footer>
        <div :is="component" :init="componentData" @update="initial"></div>
    </article>
</template>

<script>
import { mapGetters } from 'vuex'
import dialoger from '../common/dialoger'
import editor from './noteEditor'
import paper from './paper'
export default {
    components: { paper, editor, dialoger },
    data() {
        return {
            notes: [],
            selected: null,
            component: null,
            componentData: null
        }
    },
    created() {
        this.initial()
    },
    methods: {
        initial() {
            this.$socket.emit("[NOTE] GET", this.customer._id, notes => { this.notes = notes })
        },
        newNote() {
            this.$p('editor')
        },
        edit() {
            this.$p('editor', { note: this.notes[this.selected] })
        },
        remove() {
            this.$dialog({
                title: 'dialog.removeCarryNote', msg: 'dialog.removeCarryNoteTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.remove', fn: 'resolve' }]
            }).then(() => {
                let note = this.notes[this.selected];
                this.$socket.emit("[NOTE] REMOVE", note._id);
                this.notes.splice(this.selected, 1)
                this.selected = null;
                this.$q()
            }).catch(() => { this.$q() })
        },
        confirm() {
            isNumber(this.selected) && Object.assign(this.order, { carryNote: this.notes[this.selected] })
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
    height: 210px;
    width: 643px;
    padding: 5px;
}

.wrap div {
    display: inline-flex;
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