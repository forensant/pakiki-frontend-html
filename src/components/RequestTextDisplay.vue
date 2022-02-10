<template>
    <div>
        <pre v-if="isHttp">{{headers}}</pre>

        <div v-if="isHex" class="hex">
            <pre class="hex_count">{{hexLines.count}}</pre>
            <pre class="hex_data">{{hexLines.hex}}</pre>
            <pre class="hex_ascii">{{hexLines.ascii}}</pre>
        </div>
        <pre v-else>{{body}}</pre>
    </div>
</template>

<script>
    const headerSeparator = "\x0D\x0A\x0D\x0A";

    export default {
        name: 'RequestTextDisplay',

        components: {
            
        },

        computed: {
            body() {
                if(!this.isHttp) {
                    return this.request
                }

                let idx = this.request.indexOf(headerSeparator)
                if(idx == -1) {
                    return ""
                }
                return this.request.substring(idx + headerSeparator.length)
            },
            headers() {
                let idx = this.request.indexOf(headerSeparator)
                if(idx == -1) {
                    return this.request
                }
                return this.request.substring(0, idx + headerSeparator.length)
            },
            hexLines() {
                let count = '00000000'
                let hex = ''
                let ascii = ''

                for(let i = 0; i < this.body.length; i++) {
                    if(i != 0 && i % 16 == 0) {
                        count += "\n"
                        hex += "\n"
                        ascii += "\n"

                        count += (i+1).toString(16).padStart(8, '0')
                    } else if(i != 0 && i % 8 == 0) {
                        hex += "   "
                        ascii += "  "
                    }

                    let hexCode = this.body.charCodeAt(i)
                    let hexChar = this.body[i]
                    hex += hexCode.toString(16).padStart(2, '0')
                    hex += ' '

                    if(hexCode < 32 || hexCode > 126) {
                        hexChar = '.';
                    }

                    ascii += hexChar
                }

                return {
                    count: count,
                    hex: hex,
                    ascii: ascii
                }
            },
            isHex() {
                if(this.body == "") {
                    return false
                }

                for(let i = 0; i < this.body.length; i++) {
                    let hexCode = this.body.charCodeAt(i)
                    if((hexCode < 32 || hexCode > 126) && hexCode != 0x0D && hexCode != 0x0A && hexCode != 0x09) {
                        return true
                    }
                }
                
                return false
            },
        },

        props: [
            'is-http',
            'request'
        ],

        data: () => ({
        }),

        methods: {
            headerSeparator() {
                return ""
            }
        }
    }
</script>

<style>
  .hex_count {
      float: left;
  }

  .hex_data, .hex_ascii {
      float: left;
      padding-left: 20px;
  }

  pre {
      white-space: pre-wrap;
      word-break: break-all;
  }

  .theme--dark .hex_count {
      background-color: rgba(255,255,255,0.1);
  }

  .theme--light .hex_count {
      background-color: rgba(0,0,0,0.1);
  }

</style>
