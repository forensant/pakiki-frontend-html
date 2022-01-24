<template>
    <div :style="cssVars">
        <v-card height="calc(100vh - 50px)" class="pl-10 pr-10 pt-5" elevation="0" tiled v-if="loading || requests.length != 0 || scanID != undefined || search != ''">
            <v-row>
                <v-col md="6">
                </v-col>
                <v-col md="4">
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        class="mr-4 mb-0"
                        @change="onSearch"
                    ></v-text-field>
                </v-col>
                    
                    <v-col md="2">
                    <v-checkbox
                        v-model="excludeResources"
                        label="Exclude Resources"
                        class=""
                    ></v-checkbox>
                </v-col>
            </v-row>

            <DynamicScroller
                class="scroller"
                :items="requests"
                :min-item-size="32"
                key-field="GUID"
                ref="scroller"
            >
                
                <template #before>
                    <div class="grid headers" @contextmenu="onTableHeaderRightClick">
                        <span v-for="col in visibleColumns" :key="col.col">
                            <strong>
                                <a @click="sort(col.col)">
                                    {{col.name}}

                                    <template v-if="sortColumn == col.col">
                                        <v-icon v-if="sortDirection == 'asc'">mdi-chevron-down</v-icon>
                                        <v-icon v-if="sortDirection == 'desc'">mdi-chevron-up</v-icon>
                                    </template>
                                </a>
                            </strong>
                        </span>
                        <span class="last_col"  v-if="selectedColumns.includes(6)">
                            <v-row>
                                <v-col md="6">
                                    <strong>Flags</strong>
                                </v-col>


                                <v-col md="6" class="text-right">
                            
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                @click="scrollToTop"
                                                icon
                                                v-bind="attrs"
                                                v-on="on"
                                                x-small
                                            >
                                                <v-icon>mdi-arrow-up-thin-circle-outline</v-icon>
                                            </v-btn>
                                        </template>

                                        <span>Scroll to top</span>
                                    </v-tooltip>

                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                @click="scrollToBottom"
                                                icon
                                                v-bind="attrs"
                                                v-on="on"
                                                x-small
                                            >
                                                <v-icon>mdi-arrow-down-thin-circle-outline</v-icon>
                                            </v-btn>
                                        </template>

                                        <span>Scroll to bottom</span>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                        </span>
                    </div>
                    <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
                </template>

                <template v-slot="{ item, index, active }">
                    <DynamicScrollerItem
                        :item="item"
                        :active="active"
                        :size-dependencies="[
                            item.URL,
                        ]"
                        :data-index="index"
                    >
                        <div class="grid grid-contents" v-bind:class="{ selected: (selectedRequest.GUID == item.GUID) }" @click="onRowClick(item)">
                            <span v-bind:class="{'sorted-column': (sortColumn == 'time')}" v-if="selectedColumns.includes(0)">
                                {{printDate(item.Time)}}
                            </span>

                            <span v-bind:class="{'sorted-column': (sortColumn == 'url')}" v-if="selectedColumns.includes(1)">
                                <span class="domain">{{printDomainAndPath(item.URL)}}</span>
                                <span class="path">{{printQuery(item.URL)}}</span>
                            </span>

                            <span v-bind:class="{'sorted-column': (sortColumn == 'response_size')}" v-if="selectedColumns.includes(2)">
                                {{printSize(item.ResponseSize)}}
                            </span>
                            
                            <span v-bind:class="{'sorted-column': (sortColumn == 'response_time')}" v-if="selectedColumns.includes(3)">
                                {{printDuration(item.ResponseTime)}}
                            </span>

                            <span v-bind:class="{'sorted-column': (sortColumn == 'verb')}" v-if="selectedColumns.includes(4)">
                                {{item.Verb}}
                            </span>

                            <span v-bind:class="{'sorted-column': (sortColumn == 'response_status_code')}" v-if="selectedColumns.includes(5)">
                                {{item.ResponseStatusCode}}
                            </span>

                            <span class="last_col" v-if="selectedColumns.includes(6)">
                                <!-- flags -->
                                <v-icon small v-if="item.Error != ''" class="mr-1">mdi-alert-circle-outline</v-icon>
                                <v-icon small v-if="item.Notes != ''">mdi-message-outline</v-icon>
                            </span>
                        </div>
                    </DynamicScrollerItem>
                </template>
            </DynamicScroller>

            <RequestDetails class="request-details" v-bind:request="selectedRequest"></RequestDetails>
        </v-card>

        <v-card height="calc(100vh - 50px)" class="pl-10 pr-10 pt-5" elevation="0" tiled v-else>
            <RequestPlaceholder />
        </v-card>

        <v-menu v-model="showColumnSelectionMenu" :position-x="columnSelectionX" :position-y="columnSelectionY" :close-on-content-click="false" absolute offset-y>
            <v-list>
                <v-list-item-group multiple v-model="selectedColumns">
                    <v-list-item v-for="(col, index) in columns" :key="index">
                        <template v-slot:default="{ active }">
                            <v-list-item-action>
                                <v-checkbox :input-value="active"></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>{{col.name}}</v-list-item-title>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-menu>

    </div>
</template>

<script>
  import RequestDetails from './RequestDetails';
  import RequestPlaceholder from './Placeholders/Requests'

  export default {
    components: {
        RequestDetails,
        RequestPlaceholder
    },
    data () {
      return {
        columns: [
            {name: 'Time', col: 'time', space: 1},
            {name: 'URL', col: 'url', space: 5},
            {name: 'Size', col: 'response_size', space: 1},
            {name: 'Duration', col: 'response_time', space: 1},
            {name: 'Verb', col: 'verb', space: 1},
            {name: 'Status', col: 'response_status_code', space: 1},
            {name: 'Flags', col: 'flags', space: 2},
        ],
        columnSelectionX:0,
        columnSelectionY:0,
        connection: null,
        closingList: false,
        excludeResources: true,
        initialLoad: true,
        loading: true,
        previousSearch: '',
        requests: [],
        search: '',
        selectedColumns: [0,1,2,3,4,5,6],
        selectedRequest: {},
        showColumnSelectionMenu: false,
        sortColumn: 'time',
        sortDirection: 'asc',
      }
    },

    computed: {
        cssVars: function() {
            let columnWidths = ""
            this.columns.forEach((col, idx) => {
                if(this.selectedColumns.includes(idx)) {
                    columnWidths += " " + col.space + "fr";
                }
            })

            return {
                '--grid-column-widths': columnWidths
            }
        },
        visibleColumns: function() {
            let visCols = []
            this.columns.forEach((col, idx) => {
                // 6 is flags, which is handled separately
                if(this.selectedColumns.includes(idx) && idx != 6) {
                    visCols.push(col)
                }
            })
            return visCols
        }
    },

    created: function() {
        this.startWebsocket()
    },

    destroyed: function() {
        this.closingList = true
        if(this.connection != null && this.connection.readyState == 1) {
            this.connection.close(1000) // normal closure
            this.connection = null
        }
    },

    methods: {
        getInsertIndex: function(obj) {
            if(this.sortColumn == "" || this.requests.length == 0) {
                return this.requests.length
            }

            let col_map = {
                time: 'Time',
                url: 'URL',
                'response_size': 'ResponseSize',
                'response_time': 'ResponseTime',
                verb: 'Verb',
                response_status_code: 'ResponseStatusCode'
            }

            let jsKeyName = col_map[this.sortColumn]
            
            let start = 0
            let end = this.requests.length - 1
            let middle = Math.floor((start + end) / 2)

            while(start <= end) {
                middle = Math.floor((start + end) / 2)

                if(this.requests[middle][jsKeyName] === obj[jsKeyName]) {
                    return middle
                }
                else if(this.sortDirection == "asc" && this.requests[middle][jsKeyName] < obj[jsKeyName]) {
                    start = middle + 1
                }
                else if(this.sortDirection == "desc" && this.requests[middle][jsKeyName] > obj[jsKeyName]) {
                    start = middle + 1
                }
                else {
                    end = middle - 1
                }
            }

            if(middle == 0) {
                return 0
            }

            if(middle == this.requests.length - 1) {
                return this.requests.length
            }

            if(this.requests[middle][jsKeyName] > obj[jsKeyName]) {
                return middle - 1;
            }

            return middle
        },
        loadRequests: function() {
            let vm = this
            this.loading = true
            vm.requests = []

            this.$http.get('/project/requests', {
                params: {
                    scanid: vm.scanID,
                    filter: vm.search,
                    exclude_resources: vm.excludeResources,
                    sort_col: vm.sortColumn,
                    sort_dir: vm.sortDirection,
                }
            })
            .then(function (response) {
                vm.loading = false
                vm.requests = vm.requests.concat(response.data)
                if(vm.initialLoad && vm.scanID == undefined) {
                    vm.scrollToBottom()
                    vm.initialLoad = false
                }
            })
        },
        onSearch: function() {
            let searchQuery = this.search + this.excludeResources
            let prevSearch = this.previousSearch

            if(prevSearch.valueOf() !== searchQuery.valueOf()) {
                this.previousSearch = searchQuery
                this.loadRequests()
                this.startWebsocket()
            }
        },
        tableFieldsDiffer: function(req1, req2) {
            return req1.time != req2.time || 
                req1.url != req2.url ||
                req1.response_size != req2.response_size || 
                req1.response_time != req2.response_time || 
                req1.verb != req2.verb || 
                req1.status != req2.status
        },
        sort: function(col) {
            if(this.sortColumn == col) {
                if(this.sortDirection == "asc") {
                    this.sortDirection = "desc"
                }
                else {
                    this.sortDirection = "asc"
                }
            }
            else {
                this.sortColumn = col;
            }

            if(this.sortDirection == "") {
                this.sortDirection = "asc"
            }

            this.loadRequests()
        },
        startWebsocket: function() {
            if (!window["WebSocket"]) {
                return
            }
            let vm = this

            if(this.connection != null) {
                this.connection.close(1001) // going away
            }

            let url = this.$websocketUrl
            let filter = ""

            if(this.excludeResources) {
                filter = "exclude_resources:true "
            }
            if(this.search != "") {
                filter += encodeURIComponent(this.search)
            }

            if(filter != "") {
                url += "?filter=" + filter
            }
            
            this.connection = new WebSocket(url);

            this.connection.onclose = function(e) {
                if(vm.closingList) {
                    return
                }
                console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
                setTimeout(function() {
                    vm.startWebsocket();
                }, 1000);
            };
            
            this.connection.onerror = function() {
                if(this.connection != null) {
                    this.connection.close(1002); // protocol error
                }
            };

            this.connection.onmessage = function (evt) {
                var messages = evt.data.split('\n');
                for (var i = 0; i < messages.length; i++) {
                    try {
                        var jsonObj = JSON.parse(messages[i])
                        
                        if(vm.scanID != undefined && vm.scanID != jsonObj.ScanID) {
                            continue
                        }

                        if(vm.scanID == undefined && jsonObj.ScanID != "") {
                            continue
                        }

                        if(jsonObj.ObjectType == 'HTTP Request') {
                            let found = false
                            vm.requests.forEach(function(request, idx) {
                                if(request.GUID == jsonObj.GUID) {
                                    if(vm.tableFieldsDiffer(request, jsonObj)) {
                                        vm.requests.splice(idx, 1)
                                    }
                                    else {
                                        found = true
                                        vm.requests.splice(idx, 1, jsonObj)
                                    }
                                }
                            })

                            if(!found) {
                                let idx = vm.getInsertIndex(jsonObj)
                                vm.requests.splice(idx, 0, jsonObj)
                                vm.scrollToBottomIfRequired()
                            }
                        }
                    }
                    catch (e) {
                        console.log("Error processing message: " + e)
                    }
                }
            };
        },
        onRowClick: function(item) {
            this.selectedRequest = item
        },
        printDate: function(dateInEpoch) {
            let d = new Date(dateInEpoch * 1000);
            const today = new Date()

            let isToday = (d.getDate() == today.getDate() && d.getMonth() == today.getMonth() && d.getFullYear() == today.getFullYear())

            if(isToday) {
                return d.toLocaleTimeString(undefined, {
                    timeStyle: "short"
                })
            }
            else {
                return d.toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                })
            }
        },
        printDomainAndPath: function(url) {
            let pathStart = url.indexOf("?", 8)
            if(pathStart == -1) {
                return url;
            }
            return url.substring(0, pathStart)
        },
        printDuration: function(duration) {
            if(duration > 5000) {
                return (duration/1000) + "s"
            }
            
            return duration + "ms"
        },
        printQuery: function(url) {
            let pathStart = url.indexOf("?", 8)
            if(pathStart == -1) {
                return ""
            }
            return url.substring(pathStart)
        },
        printSize: function(bytes) {
            if(bytes < 1024) {
                return bytes + " B"
            }

            bytes = bytes / 1024.0
            if(bytes < 1024) {
                return bytes.toFixed(2) + " KB"
            }

            bytes = bytes / 1024.0
            if(bytes < 1024) {
                return bytes.toFixed(2) + " MB"
            }

            bytes = bytes / 1024.0
            if(bytes < 1024) {
                return bytes.toFixed(2) + " GB"
            }
        },
        scrollToBottom: function() {
            this.$refs.scroller.scrollToBottom()
        },
        scrollToBottomIfRequired: function() {
            let scroller = document.getElementsByClassName('scroller')[0]
            let sTop = scroller.scrollTop
            let height = scroller.clientHeight
            let sHeight = scroller.scrollHeight

            if(sTop + height > (sHeight - 200)) {
                this.$refs.scroller.scrollToBottom()
            }
        },
        scrollToTop: function() {
            let scroller = document.getElementsByClassName('scroller')[0]
            scroller.scrollTop = 0;
        },


        onTableHeaderRightClick (e) {
            e.preventDefault()
            this.showColumnSelectionMenu = false
            this.columnSelectionX = e.clientX
            this.columnSelectionY = e.clientY
            this.$nextTick(() => {
                this.showColumnSelectionMenu = true
            })
        },
    },

    mounted: function() {
        this.loadRequests()

        if(localStorage.selectedColumns) {
            this.selectedColumns = localStorage.selectedColumns.split(',')
            this.selectedColumns = this.selectedColumns.map( s => parseInt(s) )
        }
    },

    props: {
        scanID: String
    },

    watch: {
        excludeResources: function() {
            this.onSearch()
        },
        scanID: function() {
            this.requests = []
            this.loadRequests()
        },
        selectedColumns: function(newSelectedColumns) {
            localStorage.selectedColumns = newSelectedColumns
        }
    }
  }

</script>

<style>
    table {
        table-layout: fixed
    }

    td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .path {
        color: rgb(125, 125, 125)
    }

    .request-details {
        height: calc(40% - 60px);
        overflow-y: auto;
        margin: 17px 16px 27px 16px;
        font-size: 14px;
    }

    .theme--light .headers {
        border-bottom: 1px solid rgba(0,0,0,0.7);
    }

    .theme--dark .headers {
        border-bottom: 1px solid rgba(255,255,255,.5);
    }

    .scroller {
        overflow-y: auto;
        height: calc(60% - 60px);
        margin: 0px 16px;
    }

    .theme--light .scroller {
        border: 1px solid rgba(0,0,0,0.2);
    }

    .theme--dark .scroller {
        border: 1px solid rgba(255,255,255,0.2);
    }

    .grid {
        display: grid;
        grid-template-columns: var(--grid-column-widths);
        height: 32%;
    }

    .grid-contents:hover {
        cursor: pointer;
        background-color: rgba(76, 175, 80, 0.1);
    }

    .theme--dark .grid-contents {
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .theme--light .grid-contents {
        border-bottom: 1px solid rgba(0,0,0,0.2);
    }

    .grid > span {
        padding: 5px 10px;
        height: 100%;
     
        word-break:break-all;
        
        font-size: 14px;
    }

    .theme--light .grid > span {
        border-right: 1px solid rgba(0,0,0,0.2);
    }

    .theme--dark .grid > span {
        border-right: 1px solid rgba(255,255,255,0.2);
    }

    .grid > span.last_col {
        border-right: 0px;
    }

    .selected {
        background-color: rgba(76, 175, 80, 0.3);
    }

    .grid > span > strong > a {
        text-decoration: none;
    }

    .sorted-column {
        font-weight: 500;
    }

    .theme--light .headers a {
        color: black;
    }

    .theme--dark .headers a {
        color: white;
    }

    .theme--light .headers {
        background-color: white;
    }

    .theme--dark .headers {
        background-color: black;
    }

    .vue-recycle-scroller__slot {
        position: sticky;
        top: 0;
        z-index: 1;
    }

</style>
