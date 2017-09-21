<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="note">
            <header>
                <span>{{$t('title.note')}}</span>
            </header>
            <div class="inner">
                <div class="field">
                    <label>{{$t('text.name')}}</label>
                    <input type="text" v-model="note.name">
                </div>
                <div class="field">
                    <label>{{$t('text.content')}}</label>
                    <textarea v-model="note.content"></textarea>
                </div>
            </div>
            <footer>
                <button class="btn" @click="confirm" v-if="!save">{{$t('button.new')}}</button>
                <button class="btn" @click="confirm" v-else>{{$t('button.save')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            note: {
                name: '',
                content: ''
            },
            save: false
        }
    },
    created() {
        if (this.init.hasOwnProperty('note')) {
            this.note = JSON.parse(JSON.stringify(this.init.note));
            this.note.content = this.note.content.join('\n')
            this.save = true;
        }
    },
    computed: {
        ...mapGetters(['op', 'customer'])
    },
    methods: {
        confirm() {
            let note;
            if (this.save) {
                note = Object.assign({}, this.note);
                note.content = note.content.split('\n');
            } else {
                note = {
                    _id: ObjectId(),
                    customer: this.customer._id,
                    name: this.note.name,
                    content: this.note.content.split('\n'),
                    create: +new Date,
                    creator: this.op.name,
                    lastUse: null
                }
            }
            let vm = this;
            this.$socket.emit("[NOTE] SAVE", note);
            this.$nextTick(() => {
                this.$emit("update");
                this.init.resolve();
            })

        }
    }
}
</script>

<style scoped>
.note {
    width: 300px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

header {
    height: 40px;
    background: #009688;
    color: #fff;
    text-shadow: 0 1px 1px #333;
    display: flex;
    align-items: center;
    padding: 0 15px;
    border-bottom: 2px solid #FF9800;
}

header span {
    flex: 1;
}

.inner {
    background: #ECEFF1;
    padding: 10px 20px;
}

.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 6px;
}

.field input {
    padding: 7px;
    border: 2px solid #BDBDBD;
    border-radius: 4px;
}

.field textarea {
    border: 2px solid #bdbdbd;
    resize: none;
    border-radius: 4px;
    height: 125px;
}

.field label {
    margin-bottom: 3px;
}
</style>