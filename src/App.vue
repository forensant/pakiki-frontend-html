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
          <v-list-item-avatar>
            <v-img src="/images/Logo32.png" srcset="/images/Logo64.png 2x" alt="Proximity Logo"></v-img>
          </v-list-item-avatar>

          <v-list-item-title>Proximity</v-list-item-title>
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
        <div class="pa-2 text-center" v-if="drawerCollapsed == false">
          <a href="https://ProximityHQ.com/" class="green--text text--lighten-3 no-underline">ProximityHQ.com</a>
        </div>
      </template>

    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    drawerCollapsed: null,
    selectedMenuItem: 1,
    selectedBottomMenuItem: -1
  }),

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
