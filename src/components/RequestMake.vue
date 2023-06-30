<template>
<div class="thin-border-top">
    <v-container>
        <v-row>
            <v-col md="2">
                <v-combobox
                    v-model="protocol"
                    :items="protocolItems"
                    label="Protocol"
                ></v-combobox>
            </v-col>
            <v-col md="6">
                <v-text-field v-model="hostname" label="Hostname" />
            </v-col>
            <v-col md="4" class="text-right">
                <v-progress-circular
                    v-if="loading_oob"
                    indeterminate
                    color="primary"
                    class="mt-3 mr-5"
                ></v-progress-circular>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            class="mt-3"
                            @click="insertOOBClicked"
                        >
                        Insert OOB Domain
                        </v-btn>
                    </template>
                    <span>Insert an out of band interaction domain</span>
                </v-tooltip>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-textarea
                    v-model="request"
                    outlined
                    label="Request"
                    id="textarea_request"
                    style="font-family: monospace;"
                    >
                </v-textarea>
            </v-col>
        </v-row>

        <v-row>
            <v-col align="end">
                <v-btn
                    color="green"
                    dark
                    elevation="2"
                    @click="sendRequest"
                >
                    Send
                    <v-icon right>mdi-send</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
    
    <v-container v-if="response || loading">
        <v-card :loading="loading">
            <template slot="progress">
                <v-progress-linear
                    height="10"
                    indeterminate
                ></v-progress-linear>
            </template>

            <RequestDetails v-bind:request="response" v-if="response != null"/>
        </v-card>
    </v-container>
  </div>
</template>

<script>
  import RequestDetails from './RequestDetails';
  import {insertOOBDomain} from '../mixins/common.js'

  export default {
    name: 'RequestMake',

    components: {
        RequestDetails
    },

    data () {
      return {
          hostname:      '',
          loading:       false,
          loading_oob:   false,
          protocol:      'https://',
          protocolItems: ['https://', 'http://'],
          request:       '',
          response:      null
      }
    },

    methods: {
        insertOOBClicked: function() {
            var requestControl = document.getElementById("textarea_request");
            this.loading_oob = true;
            insertOOBDomain(this.$http,
                requestControl,
                (r => {
                    this.request = r;
                    this.loading_oob = false;
                })
            )
        },
        populateRequestData: function() {
            let vm = this
            if('request_id' in this.$route.params) {
                this.$http.get('/requests/' + vm.$route.params.request_id)
                .then(function (response) {
                    vm.hostname = response.data.Hostname,
                    vm.protocol = response.data.Protocol,
                    vm.request  = window.atob(response.data.RequestData)
                })
            }
            else {
                vm.hostname = ''
                vm.protocol = 'https://'
                vm.request = ''
                vm.response = null
            }
        },
        sendRequest: function() {
            let vm = this
            this.loading = true

            let request = {
                request: btoa(this.request),
                ssl:     (this.protocol == 'http://' ? false : true),
                host:    this.hostname
            }

            this.$http.post('/requests/make', request)
            .then(function (response) {
                vm.loading = false
                vm.response = response.data
            })
        }
    },

    mounted() {
        this.populateRequestData()
    },

    watch: {
        '$route.params.request_id': function () {
            this.populateRequestData()
        }
    }
  }
</script>

<style scoped>
  .thin-border-top {
      border-top: 1px solid rgba(0,0,0,0.2);
  }
</style>