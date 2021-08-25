<template>
    <div class="border">
        <v-menu offset-y>
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
            <tr>
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
            <tr class="pt-2" v-if="requestData != ''">
                <td class="header">Request:</td>
                <td class="table-details"><pre>{{requestData}}</pre></td>
            </tr>
            <tr class="pt-2" v-if="modifiedRequestData != ''">
                <td class="header">Modified Request:</td>
                <td class="table-details"><pre>{{modifiedRequestData}}</pre></td>
            </tr>
            <tr class="pt-2" v-if="responseData != ''">
                <td class="header">Response:</td>
                <td class="table-deatils"><pre>{{responseData}}</pre></td>
            </tr>
            <tr class="pt-2" v-if="modifiedResponseData != ''">
                <td class="header">Modified Response:</td>
                <td class="table-deatils"><pre>{{modifiedResponseData}}</pre></td>
            </tr>
        </table>

        <v-progress-linear indeterminate v-if="loading" class="mt-5"></v-progress-linear>

    </div>
</template>

<script>
  export default {
    name: 'RequestDetails',

    components: {
        
    },

    props: [
        'request'
    ],

    data: () => ({
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
                bodyFormData.append("guid", this.request.GUID)
                bodyFormData.append("notes", newVal)

                this.$http.put('/project/request', bodyFormData)
            }
        }
    },

    mounted: function() {
        this.populateRequestResponse()
    },

    methods: {
        populateRequestResponse() {
            let vm = this

            if(this.request.GUID == undefined) {
                this.loading = false
                return
            }

            this.$http.get('/project/requestresponse?guid=' + this.request.GUID)
                .then(function (response) {
                    vm.requestData  = window.atob(response.data.Request)
                    vm.responseData = window.atob(response.data.Response)
                    vm.modifiedRequestData  = window.atob(response.data.ModifiedRequest)
                    vm.modifiedResponseData = window.atob(response.data.ModifiedResponse)
                    vm.loading = false
                })
        }
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
  }

  pre {
      white-space: pre-wrap;
      word-break: break-all;
  }

  .border {
      border: 1px solid rgba(0,0,0,0.2);
      padding: 10px;
  }
</style>
