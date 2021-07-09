<template>
    <v-card class="pl-10 pr-10 pt-10 pb-10" elevation="0" outlined>
        <v-row>
            <v-col md="8">
                <div class="text-h4">Welcome</div>
                <div class="text-subtitle-1 mt-2">Grab yourself a coffee and let's get started listening for traffic!</div>

                <div class="text-body-2 mt-7">
                    <i>Once traffic is received, it will be shown here.</i><br><br>
                    
                    <strong>1. Install Certificate</strong>
                    <p>
                        In order to intercept TLS traffic, you'll need to install the root certificate into your browser or operating system. You can download the root certificate authority certificate from <a :href="$baseLocation + '/proxy/ca_certificate.pem'">here</a>.
                        How to set this up is browser/system dependent. If you're unsure how to do it, consult your browser's documentation, or search online for the latest instructions.
                    </p>

                    <strong>2. Set your proxy</strong>
                    <p>
                        Proximity is listening for traffic on <a :href="'localhost' + http11ProxyAddress">localhost{{http11ProxyAddress}}</a>. You'll need to configure your browser to use Proximity as an upstream proxy.
                        Browser plugins such as <a href="https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard/">FoxyProxy</a> for Firefox, and <a href="https://chrome.google.com/webstore/detail/smartproxy/jogcnplbkgkfdakgdenhlpcfhjioidoj">SmartProxy</a> for Chrome can be set up to only proxy the traffic you want to intercept.
                    </p>
                </div>
            </v-col>
            <v-col md="4" class="pl-10 mt-10">
                <v-img contain src="/images/HappyLaptop.svg" alt="Laptop With Coffee"></v-img>
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
