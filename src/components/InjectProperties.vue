<template>
    <v-card tile>
        <v-toolbar
            color="green"
            dark
        >
            <v-toolbar-title>Request Details</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-progress-circular
                :class="processingClass"
                indeterminate
            ></v-progress-circular>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        @click="run"
                        icon
                        v-bind="attrs"
                        v-on="on"
                        :disabled="runDisabled"
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
                                <v-card outlined max-height="400" height="400" class="overflow-y-auto">
                                    <v-card-title>FuzzDB</v-card-title>
                                    <v-card-text>
                                    
                                    <v-row class="mb-2">
                                        <v-col>
                                            <v-text-field
                                                v-model="fuzzDBSearch"
                                                label="Search Payloads"
                                                hide-details
                                                clearable
                                                outlined
                                                dense
                                                clear-icon="mdi-close-circle-outline"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>

                                    <v-treeview
                                        v-model="fuzzDBSelected"
                                        selectable
                                        :items="fuzzDBItems"
                                        item-children="SubEntries"
                                        item-text=""
                                        item-key="ResourcePath"
                                        :filter="filterFuzzDB"
                                        :search="fuzzDBSearch"
                                        activatable
                                        dense
                                    >
                                        <template v-slot:prepend="{ item }">
                                        
                                            <v-tooltip bottom v-if="item.SubEntries.length == 0">
                                                <template v-slot:activator="{ on, attrs }">
                                                    <span
                                                        v-bind="attrs"
                                                        v-on="on"
                                                    >{{item.Title}}</span>
                                                </template>
                                                <span>
                                                    <strong>Sample payloads:</strong><br>
                                                    <div v-for="(payload, idx) in item.SamplePayloads" :key="idx">
                                                        {{payload}}
                                                    </div>
                                                </span>
                                            </v-tooltip>
                                            <span v-else>
                                                {{item.Title}}
                                            </span>
                                        </template>
                                    </v-treeview>
                                  </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col md="4">
                                <v-card outlined>
                                    <v-card-title>Custom Files</v-card-title>
                                    <v-card-text>
                                        <v-file-input
                                            v-model="customFiles"
                                            multiple
                                            outlined
                                            dense
                                            label=""
                                        ></v-file-input>
                                    </v-card-text>
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
                            :disabled="runDisabled"
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
          title:              '',
          hostname:           '',
          loading:            false,
          protocol:           'https://',
          protocolItems:      ['https://', 'http://'],
          request:            '',
          customFiles:        [],
          fuzzDBItems:        [],
          fuzzDBSearch:       null,
          fuzzDBSelected:     [],
          iterateFrom:        '',
          iterateTo:          '',
          injectPointError:   '',

          processingClass:    "d-none",
          runDisabled:        false,
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
        },
        requestToInjectFormat: function() {
            var components = this.request.split(/[»«]/)
            var request = []

            for(var i = 0; i < components.length; i++) {
                request.push({
                    RequestPart: window.btoa(components[i]),
                    Inject: (i % 2 == 1 ? true : false)
                })
            }

            return request
        },
        run: function() {
            let vm = this
            vm.runDisabled = true
            vm.processingClass = ""
            let customFilePayloads = []

            // files
            let filesProcessed = 0
            for (let file of this.customFiles) {
                var reader = new FileReader();

                reader.onload = function (event) {
                    let contents = event.target.result
                    customFilePayloads = customFilePayloads.concat(contents.split("\n"))

                    filesProcessed++

                    if(filesProcessed >= vm.customFiles.length) {
                        vm.sendRequest(customFilePayloads)
                    }
                }

                reader.readAsText(file)
            }

            if(this.customFiles.length == 0) {
                this.sendRequest([])
            }

        },
        sendRequest: function (customFilePayloads) {
            let vm = this
            this.loading = true
            let customFilenames = []

            for (let file of this.customFiles) {
                customFilenames.push(file.name)
            }

            let request = {
                request:         this.requestToInjectFormat(),
                ssl:             (this.protocol == 'http://' ? false : true),
                host:            this.hostname,
                fuzzDB:          this.fuzzDBSelected,
                customPayloads:  customFilePayloads,
                customFilenames: customFilenames,
                iterateFrom:     parseInt(this.iterateFrom),
                iterateTo:       parseInt(this.iterateTo),
                title:           this.title,
            }

            this.$http.post('/inject_operations/run', request)
            .then(function (response) {
                vm.$router.push({path: '/inject/' + response.data.GUID})
            }).finally(function() {
                vm.runDisabled = false
                vm.processingClass = "d-none"
            });
        }
    },

    computed: {
        filterFuzzDB() {
            return (item, search) => item.Title.toLowerCase().indexOf(search.toLowerCase()) != -1
        }
    },

    mounted() {
        let vm = this

        this.$http.get('/inject_operations/payloads')
            .then(function (response) {
                vm.fuzzDBItems = response.data.SubEntries
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
