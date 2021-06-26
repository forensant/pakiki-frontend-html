<template>
    <v-card tile>
        <v-toolbar
            color="green"
            dark
        >
            <v-toolbar-title>Request Details</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        @click="run"
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-send</v-icon>
                    </v-btn>
                </template>

                <span>Run</span>
            </v-tooltip>
        </v-toolbar>

        <v-card tile max-height="calc(100vh - 65px)" class="overflow-y-auto">
            <v-container class="pa-5">
                <v-card>
                    <v-card-title>Request</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col md="8">
                                <v-text-field
                                    v-model="title"
                                    label="Title">
                                </v-text-field>
                            </v-col>
                        </v-row>
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
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-textarea
                                    v-model="request"
                                    outlined
                                    label="Request">
                                </v-textarea>
                                <i>Enclose parts of the request to be injected with #{}, for example: Cookie: session=#{abc123}</i>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-card class="mt-5">
                    <v-card-title>Payloads</v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col md="4">
                                <v-card outlined>
                                    <v-card-title>FuzzDB</v-card-title>
                                    <v-list>
                                        
                                        <v-list-item-group
                                            v-model="fuzzDBSelected"
                                            multiple
                                        >

                                            <template v-for="(item) in fuzzDBItems">
                                                <v-list-item
                                                    :key="item.Filename"
                                                    :value="item.Filename"
                                                >
                                                    <template v-slot:default="{ active }">
                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-list-item-content v-bind="attrs" v-on="on">
                                                                    <v-list-item-title v-text="item.Title"></v-list-item-title>
                                                                </v-list-item-content>

                                                                <v-list-item-action>
                                                                    <v-checkbox
                                                                    :input-value="active"
                                                                    color="green"
                                                                    ></v-checkbox>
                                                                </v-list-item-action>
                                                            </template>
                                                            <span>
                                                                <strong>Sample payloads:</strong><br>
                                                                <div v-for="(payload, idx) in item.SamplePayloads" :key="idx">
                                                                    {{payload}}
                                                                </div>
                                                            </span>
                                                        </v-tooltip>
                                                    </template>
                                                </v-list-item>
                                            </template>
                                        </v-list-item-group>
                                    </v-list>
                                </v-card>
                            </v-col>

                            <v-col md="4">
                                <v-card outlined>
                                    <v-card-title>Known Files</v-card-title>
                                    <v-list>
                                        
                                        <v-list-item-group
                                            v-model="knownFilesSelected"
                                            multiple
                                        >
                                            <template v-for="(item) in knownFileItems">
                                                <v-list-item :key="item.Filename" :value="item.Filename">
                                                    <template v-slot:default="{ active }">
                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-list-item-content v-bind="attrs" v-on="on">
                                                                    <v-list-item-title v-text="item.Title"></v-list-item-title>
                                                                </v-list-item-content>

                                                                <v-list-item-action>
                                                                    <v-checkbox
                                                                    :input-value="active"
                                                                    color="green"
                                                                    ></v-checkbox>
                                                                </v-list-item-action>
                                                            </template>
                                                            <span>
                                                                <strong>Sample payloads:</strong><br>
                                                                <div v-for="(payload, idx) in item.SamplePayloads" :key="idx">
                                                                    {{payload}}
                                                                </div>
                                                            </span>
                                                        </v-tooltip>
                                                    </template>
                                                </v-list-item>
                                            </template>
                                        </v-list-item-group>
                                    </v-list>
                                </v-card>
                            </v-col>

                            <v-col md="4">
                                <v-card outlined>
                                    <v-card-title>Iterate</v-card-title>
                                    
                                    <v-card-text>
                                        <v-row>
                                            <v-col>
                                                <v-text-field type="number" label="From" v-model="iterateFrom"/>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <v-text-field type="number" label="To" v-model="iterateTo"/>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-row class="mt-5">
                    <v-col class="text-right">
                        <v-btn
                            color="green"
                            dark
                            elevation="2"
                            @click="run"
                        >
                            Run
                            <v-icon right>mdi-send</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-card>
</template>

<script>
  export default {
    name: 'RequestMake',

    components: {
        
    },

    data () {
      return {
          title: '',
          hostname:      '',
          loading:       false,
          protocol:      'https://',
          protocolItems: ['https://', 'http://'],
          request:       '',
          fuzzDBItems: [],
          knownFileItems: [],
          fuzzDBSelected: [],
          knownFilesSelected: [],
          iterateFrom: '',
          iterateTo: ''
      }
    },

    methods: {
        run: function() {
            let vm = this
            this.loading = true

            let request = {
                request:     window.btoa(this.request),
                ssl:         (this.protocol == 'http://' ? false : true),
                host:        this.hostname,
                fuzzDB:      this.fuzzDBSelected,
                knownFiles:  this.knownFilesSelected,
                iterateFrom: parseInt(this.iterateFrom),
                iterateTo:   parseInt(this.iterateTo),
                title:       this.title,
            }

            this.$http.post('/inject_operations/run', request)
            .then(function (response) {
                vm.$router.push({path: '/inject/' + response.data.GUID})
            })
        }
    },

    mounted() {
        let vm = this

        this.$http.get('/inject_operations/payloads')
            .then(function (response) {
                vm.fuzzDBItems = response.data.Attack
                vm.knownFileItems = response.data.KnownFiles
            })

        if('request_id' in this.$route.params) {
            this.$http.get('/project/request', {
                params: {
                    guid: vm.$route.params.request_id,
                    highlight_parameters: true
                }
            })
            .then(function (response) {
                vm.hostname = response.data.Hostname,
                vm.protocol = response.data.Protocol,
                vm.request  = window.atob(response.data.RequestData)
            })
        }
    },

    watch: {
        '$route.params.request_id': function (id) {
            if(id == undefined) {
                this.title = ''
                this.hostname = ''
                this.protocol = 'https://'
                this.request = ''
                this.fuzzDBItems = []
                this.knownFileItems = []
                this.fuzzDBSelected = []
                this.knownFilesSelected = []
                this.iterateFrom = ''
                this.iterateTo = ''
            }
        }
    },
  }
</script>
