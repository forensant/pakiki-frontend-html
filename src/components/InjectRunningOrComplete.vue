<template>
    <v-card tile>
        <v-toolbar
            color="green"
            dark
        >
            <v-toolbar-title>{{status}} Inject Scan</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn :to="'/inject/clone/' + scan.GUID" icon v-bind="attrs" v-on="on">    
                        <v-icon>mdi-file-multiple</v-icon>
                    </v-btn>
                </template>

                <span>Clone</span>
            </v-tooltip>

            <v-tooltip bottom v-if="scan.Archived == false && scan.PercentCompleted == 100">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        @click="onArchive"
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-package-down</v-icon>
                    </v-btn>
                </template>

                <span>Archive</span>
            </v-tooltip>

            <v-tooltip bottom v-if="scan.Archived == false && scan.PercentCompleted != 100">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        @click="onCancel"
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-close-circle-outline</v-icon>
                    </v-btn>
                </template>

                <span>Cancel</span>
            </v-tooltip>
        </v-toolbar>

        <v-card tile max-height="calc(100vh - 64px)" class="overflow-y-auto">
            <v-container class="pl-10 pr-10 pt-5 margin-16">
                <v-row>
                    <v-col md="4">
                        <v-text-field
                            v-model="scan.Title"
                            label="Title"
                            v-on:change="updateTitle"
                        ></v-text-field>
                    </v-col>

                    <v-col md="3">
                    </v-col>

                    <v-col md="4">                
                        <v-progress-linear
                            v-if="scan.PercentCompleted != 100"
                            :value="scan.PercentCompleted"
                            height="25"
                            class="mt-5"
                            color="green"
                            >

                            <template v-slot:default="{ value }">
                                <strong>{{ Math.ceil(value) }}% {{ requestCountDisplay }}</strong>
                            </template>
                        </v-progress-linear>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col md="7" class="text-14">
                        <strong>Request:</strong>
                        <pre>{{requestDecode(scan)}}</pre>
                    </v-col>

                    <v-col md="4" class="text-14">
                        <strong>Injection parameters:</strong><br>
                        {{scan.InjectDescription}}

                        <span v-if="scan.Error">
                            <br><br>
                            <strong>Error</strong><br>
                            {{scan.Error}}
                        </span>
                    </v-col>


                </v-row>
            </v-container>

            <v-row>
                <v-col class="thin-border-top">
                    <RequestList :scanID="scan.GUID" :showPayloads="true"></RequestList>
                </v-col>
            </v-row>
        </v-card>
    </v-card>
</template>

<script>
  import RequestList from './RequestList';

  export default {
    name: 'InjectRunningOrComplete',

    components: {
        RequestList,
    },

    computed: {
        requestCountDisplay: function() {
            if(this.scan.TotalRequestCount !== 0 && this.scan.RequestsMadeCount !== 0) {
                return "  (" + this.scan.RequestsMadeCount + " of " + this.scan.TotalRequestCount + ")"
            }
            return ""
        },
        status: function() {
            if(this.scan.Archived) {
                return "Archived"
            }
            else if(this.scan.PercentCompleted == 100) {
                return "Completed"
            }
            else {
                return "Underway"
            }
        }
    },

    data: () => ({
        
    }),

    methods: {
        onArchive: function() {
            let vm = this

            let bodyFormData = new FormData()
            bodyFormData.append("archive", true)

            this.$http.patch('/inject_operations/' + vm.scan.GUID + '/archive', bodyFormData)
        },
        onCancel: function() {
            let vm = this

            this.$http.put('/scripts/' + vm.scan.GUID + '/cancel')
        },
        requestDecode: function(scan) {
            var req = ""
            scan.Request.forEach(requestPart => {
                if(requestPart.Inject) {
                    req += "»"
                }

                req += window.atob(requestPart.RequestPart)
                
                if(requestPart.Inject) {
                    req += "«"
                }
            })
            return req
        },
        updateTitle: function() {
            let vm = this

            let bodyFormData = new FormData()
            bodyFormData.append("title", true)

            this.$http.patch('/inject_operations/' + vm.scan.GUID + '/title', bodyFormData)
        }
    },

    props: ['scan']
  }
</script>

<style>
    pre {
        white-space: pre-wrap;
        word-break: break-all;
        font-size: 14px;
    }

    .margin-16 {
        margin: 0px 16px;
    }

    .text-14 {
        font-size: 14px;
    }

    .thin-border-top {
        border-top: 1px solid rgba(0,0,0,0.2);
    }
</style>