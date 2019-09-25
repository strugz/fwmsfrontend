<template>
  <v-footer height="auto" color="teal darken-1" app inset>
    <v-layout style="/*border-top: solid 3px #004D40*/" align-center justify-center row fill-height>
      <v-flex mx-3 pa-2 xs11>
        <v-textarea
          rows="1"
          hide-details
          dark
          auto-grow
          outline
          color="white"
          label="Comment"
          v-model="text"
          append-outer-icon="send"
          @click:append-outer="sendComment()"
          :disabled="!CurThreadDetails.TRDMST"
        ></v-textarea>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {
      text: '',
    }
  },
  computed: {
    ...mapState(['CurUserDetails', 'CurThreadDetails']),
  },
  methods: {
    ...mapActions(['postComment', 'getThreadDetailsById']),
    sendComment() {
      if (this.text.trim() == '') {
        return false
      }
      const data = { id: this.CurThreadDetails.TRDMTI, text: this.text, userID: this.CurUserDetails.USRDTL.USRDCI }
      this.postComment(data).then(
        res => {
          this.text = ''
        },
        error => {
          console.error(error)
        }
      )
    },
  },
}
</script>
