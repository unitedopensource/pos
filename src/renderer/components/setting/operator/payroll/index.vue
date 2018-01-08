<template>
    <div>
        <external title="text.from"></external>
        <external title="text.to"></external>
        <div>
            <p>{{$t('text.selectEmployee')}}</p>
            <div class="employee">
                <checkbox v-for="(operator,index) in operators" :key="index" :title="operator.name" :val="operator.name" v-model="target" :multiple="true">
                    <span class="role">({{operator.role}})</span>
                </checkbox>
            </div>
        </div>
        <external title="text.generalReport"></external>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
import external from "../../common/external";

export default {
    components: { checkbox, external },
    data() {
        return {
            operators: [],
            range: "week",
            from: "",
            to: "",
            target: []
        }
    },
    beforeRouteEnter: (to, from, next) => {
        appSocket.emit("[OPERATOR] LIST", data => {
            next(vm => {
                const sort = [
                    "Owner",
                    "Manager",
                    "Cashier",
                    "Waitstaff",
                    "Bartender",
                    "Worker",
                    "ThirdParty"
                ];
                vm.operators = data.sort((a, b) =>
                    (sort.indexOf(a.role) > sort.indexOf(b.role) ? 1 : -1))
                    .map(op => ({
                        _id: op._id,
                        name: op.name,
                        role: vm.$t('type.' + op.role)
                    }));
            });
        });
    }
}
</script>

<style scoped>
.role {
  color: rgba(0, 0, 0, 0.75);
}

p {
  padding: 15px 20px;
}

.employee {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #f5f5f5;
}

.employee .checkbox {
  width: 190px;
}

.employee .checkbox:nth-child(odd) {
  padding-right: 20px;
}
</style>