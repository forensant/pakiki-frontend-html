<template>
    <div class="border">
        <v-menu offset-y v-if="request != null && request.Protocol.includes('HTTP')">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="green"
                    dark
                    v-bind="attrs"
                    v-on="on"
                    class="float-right ml-5"
                >
                Send to...
                </v-btn>
            </template>
            <v-list>
                <v-list-item link :to="'/requests/manual/' + request.GUID">
                    <v-list-item-title>New Request</v-list-item-title>
                </v-list-item>
                <v-list-item link :to="'/inject/add/' + request.GUID">
                    <v-list-item-title>Inject</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        
        <table class="tbl_request_details">
            <tr>
                <td class="header">URL:</td>
                <td class="table-details">{{request.URL}}</td>
            </tr>
            <tr v-if="request.Protocol == 'HTTP/1.1'">
                <td class="header">Content Type:</td>
                <td class="table-details">{{request.ResponseContentType}}</td>
            </tr>
            <tr>
                <td class="header">Error:</td>
                <td class="table-details">{{request.Error}}</td>
            </tr>
            <tr>
                <td class="header pt-2">Notes:</td>
                <td class="table-details">
                    <v-row>
                        <v-col
                            cols="12"
                            sm="6"
                            md="6"
                        >
                            <v-text-field v-model="request.Notes" dense></v-text-field>
                        </v-col>
                    </v-row>
                </td>
            </tr>

            <tr v-for="(value, key) in displayDetails" v-bind:key="key">
                <td class="header">{{key}}:</td>
                <td class="table-details">{{value}}</td>
            </tr>
            
            <tr class="pt-2" v-if="modifiedRequestData != ''">
                <td class="header">Modified Request:</td>
                <td class="table-details"><RequestTextDisplay :request="modifiedRequestData" :is-http="true" :highlight="isUtf8"/></td>
            </tr>

            <tr class="pt-2" v-if="requestData != ''">
                <td class="header">{{modifiedRequestData != '' ? 'Original ' : ''}}Request:</td>
                <td class="table-details pb-8"><RequestTextDisplay :request="requestData" :is-http="true" :highlight="isUtf8"/></td>
            </tr>

            <tr class="pt-2" v-if="modifiedResponseData != ''">
                <td class="header">Modified Response:</td>
                <td class="table-deatils pb-8"><RequestTextDisplay :request="modifiedResponseData" :is-http="true" :highlight="isUtf8" /></td>
            </tr>
            
            <tr class="pt-2" v-if="responseData != ''">
                <td class="header">{{modifiedResponseData != '' ? 'Original ' : ''}}Response:</td>
                <td class="table-deatils pb-8">
                    <RequestTextDisplay v-if="!largeResponse" :request="responseData" :is-http="true" :highlight="isUtf8"/>
                    <span v-else>The response is too large to display. Please use a desktop client.</span>
                </td>
            </tr>

            <tr class="pt-2" v-if="largeResponse">
                <td class="header">Response:</td>
                <td class="table-deatils pb-8">
                    <span>The response is too large to display. Please use a desktop client.</span>
                </td>
            </tr>
            
            <tr class="pt-2" v-if="request.Protocol == 'Websocket'">
                <td class="header">Messages:</td>
                <td class="table-details">
                    <table class="tbl_websocket_messages">
                        <tr>
                            <th class="tbl_messages_header">Time</th>
                            <th class="tbl_messages_header">Direction</th>
                            <th class="tbl_messages_header">Opcode</th>
                            <th class="tbl_messages_header">Data</th>
                        </tr>

                        <tr v-for="packet in dataPackets" :key="packet.guid">
                            <td class="no-wrap">{{printDate(packet.Time)}}</td>
                            <td class="no-wrap">{{packet.Direction}}</td>
                            <td class="no-wrap">{{JSON.parse(packet.DisplayData).opcode}}</td>
                            <td>
                                <div v-if="'ModifiedData' in packet">
                                    <strong>Original:</strong><br>
                                    <RequestTextDisplay :request="base64Decode(packet.Data)" :is-http="false" /><br><br>
                                    <strong>Modified:</strong><br>
                                    <RequestTextDisplay :request="base64Decode(packet.ModifiedData)" :is-http="false" />
                                </div>
                                <div v-else>
                                    <RequestTextDisplay :request="base64Decode(packet.Data)" :is-http="false"/>
                                </div>
                            </td> 
                        </tr>

                    </table>
                </td>
            </tr>
            
        </table>

        <v-progress-linear indeterminate v-if="loading" class="mt-5"></v-progress-linear>

    </div>
</template>

<script>
  import RequestTextDisplay from './RequestTextDisplay';
  import {PrintDate} from '../mixins/common.js'

  export default {
    name: 'RequestDetails',

    components: {
        RequestTextDisplay
    },

    props: [
        'request'
    ],

    data: () => ({
        dataPackets: [],
        displayDetails: {},
        isUtf8: false,
        largeResponse: false,
        loading: true,
        modifiedRequestData: '',
        modifiedResponseData: '',
        requestData: '',
        responseData: '',
        selectedTab: 'tab-requests'
    }),

    watch: {
        request: function(/*newVal, oldVal*/) {
            this.loading = true
            this.requestData = ''
            this.responseData = ''
            this.populateRequestResponse()
        },
        'request.Notes': function(newVal) {
            if(!this.loading) {
                let bodyFormData = new FormData()
                bodyFormData.append("notes", newVal)

                this.$http.patch('/requests/' + this.request.GUID + "/notes", bodyFormData)
            }
        }
    },

    mounted: function() {
        this.populateRequestResponse()
    },

    methods: {
        base64Decode(str) {
            return window.atob(str)
        },
        populateRequestResponse() {
            let vm = this

            if(this.request == null) {
                return
            }

            if(this.request.GUID == undefined) {
                this.loading = false
                return
            }

            this.$http.get('/requests/' + this.request.GUID + '/contents?highlight=true')
                .then(function (response) {
                    vm.displayDetails = {}
                    vm.isUtf8 = response.data.IsUTF8
                    vm.requestData  = window.atob(response.data.Request)
                    vm.responseData = window.atob(response.data.Response)
                    vm.modifiedRequestData  = window.atob(response.data.ModifiedRequest)
                    vm.modifiedResponseData = window.atob(response.data.ModifiedResponse)
                    vm.largeResponse = response.data.LargeResponse
                    vm.dataPackets = vm.processDataPackets(response.data.DataPackets)
                    vm.loading = false
                })
        },
        processDataPackets(dataPackets) {
            if(dataPackets == null) {
                return null
            }
            let newDataPackets = []
            dataPackets.forEach(packet => {
                if(this.request.Protocol == 'Out of Band') {
                    if(packet.DisplayData != "") {
                        this.displayDetails = JSON.parse(packet.DisplayData)

                        for(const [k, v] of Object.entries(this.displayDetails)) {
                            if(v == undefined || v == '') {
                                delete this.displayDetails[k]
                            }
                        }
                    }

                    if(packet.Direction == "Request") {
                        this.requestData  = window.atob(packet.Data)
                    }
                    else {
                        this.responseData  = window.atob(packet.Data)
                    }
                }

                let found = false

                for(var i = 0; i < newDataPackets.length; i++) {    
                    if(newDataPackets[i].GUID == packet.GUID) {
                        if(newDataPackets[i].Modified) {
                            newDataPackets[i]['ModifiedData'] = newDataPackets[i].Data
                            newDataPackets[i].Data = packet.Data
                        } else if(packet.Modified) {
                            newDataPackets[i]['ModifiedData'] = packet.Data
                        }

                        found = true
                        break
                    }
                }

                if(!found) {
                    newDataPackets.push(packet)
                }
            });

            return newDataPackets
        },
        printDate: function(dateInEpoch) {
            return PrintDate(dateInEpoch)
        },
    }
  }
</script>

<style>
  .tbl_request_details {
      table-layout: auto;
      
  }
  .tbl_request_details .table-details {
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
  }

  .tbl_request_details td {
      vertical-align: top;
      padding-bottom: 5px;
  }

  .tbl_request_details .header {
      text-align: right;
      font-weight: bold;
      padding-right: 15px;
      min-width: 150px;
  }

  pre {
      white-space: pre-wrap;
      word-break: break-all;
  }

  .border {
      border: 1px solid rgba(0,0,0,0.2);
      padding: 10px;
  }

  .tbl_websocket_messages th {
      text-align: left;
      font-weight: bold;
      padding-right: 15px;
      white-space: nowrap;
  }

  .tbl_websocket_messages td {
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
  }

  .tbl_websocket_messages .no-wrap {
      white-space:pre;
      overflow-wrap: normal;
      word-break:keep-all;
  }

  .tbl_websocket_messages {
      border-collapse: collapse;
  }

  .tbl_websocket_messages td {
      padding: 3px 5px;
  }

  .tbl_websocket_messages th {
      padding: 3px 5px;
  }

  .theme--dark .tbl_websocket_messages {
      border: 1px solid rgba(255,255,255,0.2);
  }

  .theme--dark .tbl_websocket_messages th {
      border: 1px solid rgba(255,255,255,0.2);
  }

  .theme--dark .tbl_websocket_messages td {
      border: 1px solid rgba(255,255,255,0.2);
  }

  .theme--light  .tbl_websocket_messages {
      border: 1px solid rgba(0,0,0,0.2);
  }

  .theme--light  .tbl_websocket_messages th {
      border: 1px solid rgba(0,0,0,0.2);
  }

  .theme--light  .tbl_websocket_messages td {
      border: 1px solid rgba(0,0,0,0.2);
  }
</style>
