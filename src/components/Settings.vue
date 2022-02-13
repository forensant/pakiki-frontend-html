<template>
    <div>
        <v-card
            class="mx-auto mt-10"
            max-width="344"
            outlined
        >
            <v-list-item three-line>
                <v-list-item-content>
                    <div class="overline mb-4">
                        Certificate
                    </div>
                    
                    <v-card-actions>
                        <v-btn
                            text
                            :href="$store.state.baseLocation + '/proxy/ca_certificate.pem'"
                        >
                            Download
                        </v-btn>
                    </v-card-actions>
                    
                </v-list-item-content>
            </v-list-item>
        </v-card>

        <v-card
            class="mx-auto mt-10"
            max-width="344"
            outlined
        >
            <v-list-item three-line>
                <v-list-item-content>
                    <div class="overline mb-4">
                        Proxy
                    </div>
                    
                    <v-text-field
                        label="HTTP/1.1 Proxy Address"
                        v-model="http11ProxyAddress"
                        outlined
                    ></v-text-field>
                    
                    <v-text-field
                        label="Upstream HTTP/1.1 Proxy"
                        v-model="http11UpstreamProxyAddress"
                        outlined
                    ></v-text-field>

                    <v-text-field
                        label="Concurrent Connections per Host"
                        v-model="maxConnectionsPerHost"
                        outlined
                    ></v-text-field>
                </v-list-item-content>
            </v-list-item>

            <v-card-text v-if="proxyError">
                {{proxyError}}
            </v-card-text>

            <v-card-actions>
                <v-btn
                    text
                    @click="applyProxySettings"
                >
                    Apply
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-card
            class="mx-auto mt-10"
            max-width="344"
            outlined
        >
            <v-list-item three-line>
                <v-list-item-content>
                    <div class="overline mb-4">
                        User Interface
                    </div>

                    <v-select
                        :items="themeItems"
                        label="Theme"
                        outlined
                        v-model="theme"
                        @change="onThemeChanged"
                    ></v-select>
                </v-list-item-content>
            </v-list-item>
        </v-card>

    </div>
</template>

<script>
    export default {
        name: 'Settings',

        components: {
        },

        data () {
            return {
                themeItems: ['System', 'Dark', 'Light'],
                theme: '',
                http11ProxyAddress: '',
                http11UpstreamProxyAddress: '',
                maxConnectionsPerHost: '',
                proxyError: ''
            }
        },

        methods: {
            applyProxySettings() {
                let vm = this

                this.$http.put('/proxy/settings', {
                    Http11ProxyAddr: vm.http11ProxyAddress,
                    Http11UpstreamProxyAddr: vm.http11UpstreamProxyAddress,
                    MaxConnectionsPerHost: parseInt(this.maxConnectionsPerHost)
                }).then(function (response) {
                    if(response.status != 200) {
                        vm.proxyError = response.data
                    }
                    else {
                        vm.proxyError = 'Settings applied successfully'
                    }
                }).catch(function (error) {
                    vm.proxyError = error.response.data
                })
            },
            onThemeChanged: function() {
                localStorage.setItem("theme", this.theme)
                this.setTheme(this.theme)
            }
        },

        mounted() {
            this.theme = localStorage.getItem("theme");
            if(!this.theme) {
                this.theme = 'System'
            }

            let vm = this

            this.$http.get('/proxy/settings')
                .then(function (response) {
                    vm.http11ProxyAddress = response.data.Http11ProxyAddr
                    vm.http11UpstreamProxyAddress = response.data.Http11UpstreamProxyAddr
                    vm.maxConnectionsPerHost = response.data.MaxConnectionsPerHost
                })
        }
    }
</script>
