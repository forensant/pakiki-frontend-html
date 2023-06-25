<template>
  <v-app id="inspire">
    <v-navigation-drawer
      app
      permanent
      expand-on-hover
      dark
      :mini-variant.sync="drawerCollapsed"
    >
    
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar rounded="0">
            <v-img src="/images/Logo32.png" srcset="/images/Logo64.png 2x" alt="Pākiki Logo"></v-img>
          </v-list-item-avatar>
          <v-list-item-title>Pākiki Proxy</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="selectedMenuItem"
        >
          <v-list-item link to="/requests">
            <v-list-item-icon>
              <v-icon>mdi-format-list-bulleted-square</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Requests</v-list-item-title>
          </v-list-item>

          <v-list-item link to="/inject">
            <v-list-item-icon>
              <v-icon>mdi-cog-box</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Inject</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item link to="/settings">
            <v-list-item-icon>
              <v-icon>mdi-cogs</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
        </v-list-item-group>

      </v-list>

      <template v-slot:append>
        <div class="pb-2 text-center" v-if="drawerCollapsed == false">
          <a href="https://pakikiproxy.com/" class="green--text text--lighten-3 no-underline">PākikiProxy.com</a>
        </div>
      </template>

    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>

      <v-dialog
        v-model="showAuthDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Login</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="API Key"
                    v-model="apiKey"
                    required
                    @keydown.enter.prevent="authenticate"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green darken-1"
              text
              @click="authenticate()"
            >
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    apiKey: '',
    drawerCollapsed: null,
    selectedMenuItem: 1,
    selectedBottomMenuItem: -1,
    showAuthDialog: false,
  }),

  methods: {
    authenticate() {
      this.showAuthDialog = false
      localStorage.coreAPIKey = this.apiKey
      this.$http.defaults.headers.common['X-API-Key'] = this.apiKey
      this.$router.go() // reload the page
    }
  },

  beforeCreate: function() {
    if(localStorage.coreAPIKey) {
      this.$http.defaults.headers.common['X-API-Key'] = localStorage.coreAPIKey
      this.$store.commit('updateAPIKey', localStorage.coreAPIKey)
    }

    this.$http.interceptors.response.use(undefined, err => {
      const error = err.response;
      if (error.status===401 && error.config && !error.config.__isRetryRequest) {
        if(this.showAuthDialog !== true) {
          this.showAuthDialog = true;
        }

        return Promise.reject(error);
      }
    });
  },

  mounted: function() {
    this.setTheme(localStorage.getItem('theme'))
  }
};
</script>

<style>
  /* remove the scrollbar on the right */
  html { overflow-y: auto }

  .no-underline {
    text-decoration: none;
  }

  .no-underline:hover {
    text-decoration: underline;
  }
</style>

<!-- original layout from: https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/examples/wireframes/discord.vue -->
