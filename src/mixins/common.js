import Vue from 'vue'

Vue.mixin({
    methods: {
        setTheme: function(theme) {
            if(theme == "System" || !theme) {
              if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
                theme = "Dark"
              }
              else {
                theme = "Light"
              }
            }
      
            this.$vuetify.theme.dark = (theme == "Dark")
          }
    }
})
