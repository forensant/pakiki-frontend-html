<template>
    <v-card tile elevation="0">
        <v-tabs
            v-model="selectedTab"
            dark
            background-color="#319f3d"
        >
            <v-tab href="#tab-requests" to="/requests">Requests</v-tab>
            <v-tab href="#tab-manual" to="/requests/manual">Manual</v-tab>
        </v-tabs>

        <v-tabs-items v-model="selectedTab">
            <v-tab-item value="/requests" >
                <v-card outlined tile>
                    <RequestList/>
                </v-card>
            </v-tab-item>

            <v-tab-item value="/requests/manual" >
                <v-card tile elevation="0">
                    <RequestMake/>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script>
  import RequestList from './RequestList';
  import RequestMake from './RequestMake';

  export default {
    name: 'RequestTabs',

    components: {
        RequestList,
        RequestMake,
    },

    data: () => ({
      selectedTab: 'tab-requests'
    }),
  }
</script>
