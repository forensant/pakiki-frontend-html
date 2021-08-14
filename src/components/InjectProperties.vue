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
                            <v-col md="4">
                                <v-btn class="mt-3" @click="insertSeparatorIntoRequest">Insert Separator</v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-textarea
                                    v-model="request"
                                    outlined
                                    label="Request"
                                    id="textarea_request">
                                </v-textarea>
                                <div>{{injectPointError}}</div>
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
          iterateTo: '',
          injectPointError: '',
      }
    },

    methods: {
        ensureSeparatorValidity: function() {
            var startCharacter = String.fromCharCode(187); // »
            var endCharacter   = String.fromCharCode(171); // «

            var separatorCount = 0;

            for(var i = 0; i < this.request.length; i++) {
                var chr = this.request.charAt(i);
                if(chr != startCharacter && chr != endCharacter) {
                    continue;
                }

                separatorCount += 1;

                if(separatorCount % 2 == 1 && chr != startCharacter) {
                    this.request = this.request.substring(0, i)
                            + startCharacter
                            + this.request.substring(i + 1, this.request.length);
                }

                if(separatorCount % 2 == 0 && chr != endCharacter) {
                    this.request = this.request.substring(0, i)
                            + endCharacter
                            + this.request.substring(i + 1, this.request.length);
                }
                
            }
        },
        insertSeparatorIntoRequest: function() {
            var requestControl = document.getElementById("textarea_request");
            var startCharacter = String.fromCharCode(187); // »
            var endCharacter   = String.fromCharCode(171); // «

            if (requestControl.selectionStart || requestControl.selectionStart == '0') {
                var startPos = requestControl.selectionStart;
                var endPos = requestControl.selectionEnd;

                var startCharacterPos = this.request.lastIndexOf(startCharacter, startPos);
                var endCharacterPos  = this.request.lastIndexOf(endCharacter, startPos);

                var value = startCharacter;

                if(startCharacterPos != -1 && endCharacterPos < startCharacterPos) {
                    value = endCharacter;
                }

                if(startPos == endPos) {
                    this.request = this.request.substring(0, startPos)
                        + value
                        + this.request.substring(endPos, this.request.length);

                    this.ensureSeparatorValidity()

                    // allow a second for the other events to popagate
                    setTimeout(() => {
                        requestControl.selectionEnd = endPos + 1;
                    }, 10);
                    requestControl.focus();
                }
                else {
                    // a multi-character section has been made

                    var validationError = false;

                    // ensure that we don't already have a selection within this range
                    for (var i = startPos; i < endPos; i++) {
                        var chr = this.request.charAt(i);
                        if(chr == startCharacter || chr == endCharacter) {
                            this.injectPointError = "There is already a selection covering this range.";
                            validationError = true;
                        }
                    }

                    // ensure we want to begin a character range
                    if(value != startCharacter) {
                        this.injectPointError = "A previous injection point hasn't been closed off."
                        validationError = true;
                    }

                    if(!validationError) {
                        this.request = this.request.substring(0, endPos)
                            + endCharacter
                            + this.request.substring(endPos, this.request.length);

                        this.request = this.request.substring(0, startPos)
                            + startCharacter
                            + this.request.substring(startPos, this.request.length);
                    }

                    // allow a second for the other events to popagate
                    setTimeout(() => {
                        var offset = (validationError ? 0 : 1);
                        requestControl.selectionStart = startPos + offset;
                        requestControl.selectionEnd   = endPos + offset;
                    }, 10);
                    requestControl.focus();
                }
            }
            this.requestToInjectFormat();
        },
        requestToInjectFormat: function() {
            var components = this.request.split(/[»«]/)
            var request = []

            for(var i = 0; i < components.length; i++) {
                request.push({
                    text: window.btoa(components[i]),
                    inject: (i % 2 == 1 ? true : false)
                })
            }

            return request
        },
        run: function() {
            let vm = this
            this.loading = true

            let request = {
                request:     requestToInjectFormat,
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
