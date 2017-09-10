<template>
    <div>
        <section class="card">
            <header>
                <span>{{$t('setting.config')}}</span>
                <span class="tip"></span>
            </header>
            <article>
                <smart-input v-model="operator.name" label="text.name"></smart-input>
                <smart-option v-model="operator.role" label="text.role" :options="roles"></smart-option>
                <smart-input v-model="operator.pin" label="text.password" type="password"></smart-input>
                <smart-option v-model="operator.language" label="text.defaultLanguage" :options="languages"></smart-option>
                <smart-switch v-model="operator.timeCard" label="text.timeCard"></smart-switch>
                <smart-input v-model="operator.employeeCard" label="text.employeeCard" type="password"></smart-input>

            </article>
        </section>
        <section class="card list">
            <header>{{$t('setting.permission')}}
                <span class="tip">{{$t('setting.permissionTip')}}</span>
            </header>
            <div class="header">
                <span class="name">{{$t('text.name')}}</span>
                <span class="f1">{{$t('text.apply')}}</span>
            </div>
            <article>
                <div class="datalist">
                    <span class="name">{{$t('setting.access')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.access" val="setting" label="text.setting" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="report" label="text.report" :multiple="true"></checkbox>
                        <checkbox v-model="operator.access" val="terminal" label="text.terminal" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('setting.modify')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.modify" val="price" label="text.price" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="order" label="text.order" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="driver" label="text.driver" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="transaction" label="text.transaction" :multiple="true"></checkbox>
                        <checkbox v-model="operator.modify" val="discount" label="text.discount" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('setting.view')}}</span>
                    <div class="f1">
                        <checkbox v-model="operator.view" val="summary" label="text.viewSummary" :multiple="true"></checkbox>
                        <checkbox v-model="operator.view" val="invoices" label="text.viewInvoices" :multiple="true"></checkbox>
                        <checkbox v-model="operator.view" val="tables" label="text.viewTables" :multiple="true"></checkbox>
                    </div>
                </div>
                <div class="datalist">
                    <span class="name">{{$t('text.cashDrawer')}}</span>
                    <div class="f1">
                        <radio v-model="operator.cashCtrl" val="enable" label="text.enable" name="cashCtrl"></radio>
                        <radio v-model="operator.cashCtrl" val="stuffBank" label="text.stuffBank" name="cashCtrl"></radio>
                        <radio v-model="operator.cashCtrl" val="disable" label="text.disallow" name="cashCtrl"></radio>
                    </div>
                </div>
            </article>
        </section>
    </div>
</template>

<script>
import smartOption from '../common/smartOption'
import smartSwitch from '../common/smartSwitch'
import smartInput from '../common/smartInput'
import checkbox from '../common/checkbox'
import radio from '../common/radio'
export default {
    props: ['profile'],
    components: { smartOption, smartSwitch, smartInput, checkbox, radio },
    data() {
        return {
            languages: [
                { label: this.$t("text.primary") + ' us-en', value: "usEN" },
                { label: this.$t("text.secondary") + ' zh-cn', value: "zhCN" }],
            roles: ['Manager', 'Cashier', 'Waitstaff', 'Bartender', 'ThirdParty'],
            operator: {},
        }
    },
    created() {
        this.operator = JSON.parse(JSON.stringify(this.profile))
    },
    watch: {
        operator: {
            handler(n) {
                let keys = Object.keys(n);
                let isChange = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.profile[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.profile[key]);
                })
                isChange ? this.$emit("change", n) : this.$emit("unchanged");
            }, deep: true
        }
    }
}
</script>

<style scoped>
.f1 {
    display: flex;
    flex-wrap: wrap;
}

.header {
    padding: 10px 20px;
    background: #4D6D83;
    color: #fff;
    display: flex;
    border-bottom: 1px solid #455A64;
}

.name {
    width: 150px;
}

.datalist .name {
    text-align: center;
}

.datalist .f1{
    margin-left: 2em;
}
</style>