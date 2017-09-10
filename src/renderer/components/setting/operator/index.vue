<template>
    <div>
        <header>
            <h1>{{$t('title.softwareOperator')}}</h1>
            <div class="summary">
                <div>{{$t('text.managerCount',count.manager)}}</div>
                <div>{{$t('text.staffCount',count.staff)}}</div>
                <div>{{$t('text.thirdPartyCount',count.thirdParty)}}</div>
            </div>
        </header>
        <ul>
            <li v-for="(operator,index) in operators" :key="index" @click="getProfile(operator)">
                <i class="fa fa-user-circle-o"></i>
                <h3>{{operator.name}}</h3>
                <h5>{{operator.role}}</h5>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            operators: []
        }
    },
    created() {
        this.$socket.emit("[INQUIRY] OPERATORS", operators => {
            this.operators = operators
        })
        this.$emit("profile", null)
    },
    methods: {
        getProfile(operator) {
            this.$emit("profile", operator)
            this.$router.push({ name: 'Setting.operator.profile' })
        }
    },
    computed: {
        count() {
            let manager = 0, staff = 0, thirdParty = 0;
            this.operators.forEach(operator => {
                switch (operator.role) {
                    case 'Manager':
                        manager++;
                        break;
                    case 'ThirdParty':
                        thirdParty++;
                        break;
                    default:
                        staff++;
                }
            })
            return { manager, staff, thirdParty }
        }
    }
}
</script>

<style scoped>
header {
    height: 140px;
    padding: 45px;
    background: #eee;
}

h1 {
    font-size: 34px;
    color: #37474F;
    font-family: 'Microsoft YaHei';
}

.summary {
    color: #666;
    padding: 15px;
}

ul {
    display: flex;
    justify-content: flex-start;
    padding: 25px 12px;
    flex-wrap: wrap;
}

li {
    text-align: center;
    padding: 7px 0px;
    margin: 7px;
    background: linear-gradient(#fefefe, #cfd0d3);
    width: 140px;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

li:active {
    background: linear-gradient(#E2E3E4, #AAADB4);
    color: #333;
}

h3 {
    color: #333;
}

h5 {
    color: #9E9E9E;
    font-weight: normal;
}
</style>