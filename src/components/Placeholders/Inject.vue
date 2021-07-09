<template>
    <v-card class="pl-10 pr-10 pt-10 pb-10" elevation="0" outlined>
        <v-row>
            <v-col md="8">
                <div class="text-h4">Inject</div>
                <div class="text-subtitle-1 mt-2">Blast a number of requests at a server, to partially automate testing.</div>

                <div class="text-body-2 mt-7">
                    You can change specific parts of each request in order to attempt to exploit vulnerabilities.
                    This can be used for a number of tasks, common uses may include:

                    <ul>
                        <li>Sending malicious payloads designed trigger SQL injection, cross site scripting, etc, and then closely monitoring the responses to check for indications the attacks were successful.</li>
                        <li>Finding records you do not have access to, via direct object reference vulnerabilities.</li>
                        <li>Finding hidden files or directories.</li>
                    </ul>

                    <br>

                    To get started, the easiest way is to send a request from elsewhere in the proxy to here. Alternatively you can click the "Add" button in the top right corner to create a request from scratch.
                </div>
            </v-col>
            <v-col md="4" class="pl-10 pt-10 pr-5">
                <v-img contain src="/images/Pinchy.svg" alt="Conveyor belt with a robotic arm"></v-img>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
    export default {
        name: 'Requests',

        data () {
            return {
                http11ProxyAddress: '',
            }
        },

        mounted() {
            let vm = this

            this.$http.get('/proxy/settings')
                .then(function (response) {
                    vm.http11ProxyAddress = response.data.Http11ProxyAddr
                })
        }
    }
</script>
