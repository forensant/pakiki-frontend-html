<template>
    <div>
        <v-row no-gutters>
            <v-col :cols="scansHaveBeenStarted ? 3 : 12">
                <v-card elevation="0" tile>
                    <v-toolbar
                        color="#319f3d"
                        dark
                        flat
                    >
                        <v-toolbar-title>Inject</v-toolbar-title>
                        <v-spacer></v-spacer>

                        <v-btn @click="selectedScan = 'add'" to="/inject/add" icon>
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-toolbar>

                    <v-card height="calc(100vh - 50px)" class="pl-10 pr-10 pt-5" elevation="0" tiled v-if="scansHaveBeenStarted == false">
                        <InjectPlaceholder />
                    </v-card>

                    <div v-else>
                        <div v-if="scansPresent == false" class="mt-10 ml-4 mr-4 text-justify grey--text">Scans will appear here once they have started.</div>
                        <v-list elevation="0" three-line max-height="calc(100vh - 65px)" class="overflow-y-auto">
                            <v-list-item-group v-model="selectedScan" active-class="green--text">
                                <v-subheader v-if="completedItems.length > 0">Completed</v-subheader>
                                <v-divider v-if="completedItems.length > 0" />

                                <template v-for="(item, idx) in completedItems">
                                    <v-list-item
                                        :key="`completeditems-${idx}`"
                                        :value="item"
                                        :to="'/inject/' + item.GUID"
                                    >
                                
                                        <v-list-item-avatar>
                                            <v-icon large color="grey lighten-1">mdi-checkbox-marked-circle</v-icon>
                                        </v-list-item-avatar>
                                    
                                        <v-list-item-content>
                                            <v-list-item-title>{{item.Title}}</v-list-item-title>
                                            <v-list-item-subtitle>
                                                <span class="text--primary">{{item.URL}}</span> &mdash; 
                                                {{item.InjectDescription}}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>

                                <v-subheader v-if="underwayItems.length > 0">Underway</v-subheader>
                                <v-divider  v-if="underwayItems.length > 0" />

                                <template v-for="(item, idx) in underwayItems">
                                    <v-list-item
                                        :key="`underwayitems-${idx}`"
                                        :value="item"
                                        :to="'/inject/' + item.GUID"
                                    >
                                
                                        <v-list-item-avatar>
                                            <v-progress-circular :value="item.PercentCompleted"></v-progress-circular>
                                        </v-list-item-avatar>
                                    
                                        <v-list-item-content>
                                            <v-list-item-title>{{item.Title}}</v-list-item-title>
                                            <v-list-item-subtitle>
                                                <span class="text--primary">{{item.URL}}</span> &mdash; 
                                                {{item.InjectDescription}}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>

                                <v-subheader v-if="archivedItems.length > 0">Archived</v-subheader>
                                <v-divider v-if="archivedItems.length > 0" />

                                <template v-for="(item, idx) in archivedItems">
                                    <v-list-item
                                        :key="`archiveditems-${idx}`"
                                        :value="item"
                                        :to="'/inject/' + item.GUID"
                                    >
                                
                                        <v-list-item-avatar>
                                            <v-icon large color="grey lighten-1">mdi-package-down</v-icon>
                                        </v-list-item-avatar>
                                    
                                        <v-list-item-content>
                                            <v-list-item-title>{{item.Title}}</v-list-item-title>
                                            <v-list-item-subtitle>
                                                <span class="text--primary">{{item.URL}}</span> &mdash; 
                                                {{item.InjectDescription}}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-list-item-group>
                        </v-list>
                    </div>
                </v-card>
            </v-col>
            
            <v-col v-if="scansHaveBeenStarted" cols="9">
                <InjectProperties v-if="selectedScan == '' || selectedScan == 'add'"></InjectProperties>
                <InjectRunningOrComplete v-else :scan="selectedScan"></InjectRunningOrComplete>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import InjectPlaceholder from './Placeholders/Inject'
    import InjectProperties from './InjectProperties';
    import InjectRunningOrComplete from './InjectRunningOrComplete'

    export default {
        name: 'InjectList',

        created: function() {
            this.startWebsocket()
        },

        components: {
            InjectPlaceholder,
            InjectProperties,
            InjectRunningOrComplete,
        },


        computed: {
            scansHaveBeenStarted: function() {
                return this.scansPresent ||
                    this.selectedScan == 'add' ||
                    this.$route.params.scan_id == 'add'
            },
            scansPresent: function() {
                return this.completedItems.length != 0 ||
                    this.underwayItems.length != 0 ||
                    this.archivedItems.length != 0 ||
                    this.loading
            }
        },

        data: () => ({
            archivedItems: [],
            completedItems: [],
            underwayItems: [],

            closingList: false,
            loading: true,
            selectedScan: '',
        }),

        destroyed: function() {
            this.closingList = true
            this.connection.close(1001) // going away
            this.connection = null
        },

        methods: {
            addInjectObjToArray: function(injectObj) {
                let vm = this

                if(injectObj.GUID == this.$route.params.scan_id) {
                    if(injectObj.DoNotRecord) {
                        injectObj.Title = this.selectedScan.Title
                    }
                    this.selectedScan = injectObj
                }

                if(injectObj.Archived) {
                    vm.removeFromArray(this.underwayItems, injectObj)
                    vm.removeFromArray(this.completedItems, injectObj)
                    if(!this.isInArray(this.archivedItems, injectObj)) {
                        this.archivedItems.push(injectObj);
                    }
                }
                else if(injectObj.PercentCompleted == 100) {
                    vm.removeFromArray(this.underwayItems, injectObj)
                    if(!this.isInArray(this.completedItems, injectObj)) {
                        this.completedItems.push(injectObj);
                    }
                }
                else {
                    let found = false
                    vm.underwayItems.forEach(function(scan ,idx) {
                        if(scan.GUID == injectObj.GUID) {
                            found = true
                            vm.underwayItems.splice(idx, 1, injectObj)
                            return
                        }
                    })

                    if(found == false) {
                        this.underwayItems.push(injectObj)
                    }
                }

                if(injectObj.GUID == this.selectedScan.GUID) {
                    this.selectedScan = injectObj
                }
            },
            isInArray: function(arr, injectObj) {
                let found = false
                arr.forEach(function(scan) {
                    if(scan.GUID == injectObj.GUID) {
                        found = true
                    }
                })

                return found
            },
            removeFromArray: function(arr, injectObj) {
                arr.forEach(function(scan ,idx) {
                    if(scan.GUID == injectObj.GUID) {
                        arr.splice(idx, 1)
                        return
                    }
                })
            },
            startWebsocket: function() {
                if (!window["WebSocket"]) {
                    return
                }
                let vm = this

                if(this.connection != null) {
                    this.connection.close(1001); // going away
                }
                
                this.connection = new WebSocket(this.$websocketUrl);

                this.connection.onclose = function(e) {
                    if(vm.closingList) {
                        return
                    }
                    console.log('Inject socket is closed. Reconnect will be attempted in 1 second.', e.reason);
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
                            if(jsonObj.ObjectType == 'Inject Operation') {
                                vm.addInjectObjToArray(jsonObj)
                            }
                        }
                        catch (e) {
                            console.log("Error processing message: " + e)
                        }
                    }
                };
            }
        },
        
        mounted: function() {
            let vm = this

            this.$http.get('/inject_operations')
                .then(function (response) {
                    response.data.forEach(function(injectObj) {
                        vm.addInjectObjToArray(injectObj)
                    })

                    vm.loading = false
                })
        },

        watch: {
            '$route.params.scan_id': function (id) {
                if(id == 'add') {
                    this.selectedScan = ''
                }
            }
        },
    }
</script>