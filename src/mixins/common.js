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

export function insertOOBDomain(httpClient, widget, requestSetFunc) {
  httpClient.get('/proxy/out_of_band/url').then(function (response) {
      let domain = response.data
      
      if (widget.selectionStart || widget.selectionStart == '0') {
          var startPos = widget.selectionStart;
          var endPos = widget.selectionEnd;

          let textContent = widget.value

          let request = textContent.substring(0, startPos) + domain + textContent.substring(endPos, textContent.length);
          widget.innerText = request

          requestSetFunc(request)

          setTimeout(() => {
            widget.selectionEnd = endPos + domain.length;
          }, 10);

          widget.focus();
      }
  })
}

export function PrintDate(dateInEpoch) {
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
}
