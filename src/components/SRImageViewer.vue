<template>
    <v-dialog v-model="imgDialog" max-width="500">
        <template v-slot:activator="{ on }">
            <v-btn small flat icon color="indigo" class="ma-0" dark v-on="on">
                <v-icon>image</v-icon>
            </v-btn>
        </template>
        <v-card max-width="500">
            <v-card-title primary-title class="primary lighten-2">
                Image Viewer
            </v-card-title>
            <v-card-text class="text-center">
                <v-carousel :cycle="false" @change="carouselChange">
                    <v-carousel-item v-for="(item, index) in imgLink" :key="index">
                        <v-sheet class="fill-height ma-0">
                            <v-container fluid fill-height>
                                <v-img :src="item.src" @dblclick="downloadImage(item.src)"></v-img>
                            </v-container>
                        </v-sheet>
                    </v-carousel-item>
                </v-carousel>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
    data() {
        return {
            imgDialog: false,
            imgLink: [],
            imageValue: null,
            currentIndex: 0,
            image: null
        }
    },
    computed: {
        ...mapState(["CurThreadDetails"]),
    },
    created() {
        this.LoadImageLink();
    },
    methods: {
        ...mapActions(["getImageLink"]),
        LoadImageLink() {
            this.getImageLink(this.CurThreadDetails.TRDMTT)
                .then(res => {
                    this.imgLink = res.data;
                })
        },

        carouselChange(newIndex) {
            this.currentIndex = newIndex;
            this.imageValue = this.imgLink[newIndex].src;
            console.log(this.imageValue);
        },
        async downloadImage(imageSrc) {
            try {
                const response = await fetch(imageSrc);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = imageSrc.substring(imageSrc.lastIndexOf('/') + 1) + '.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        }
    }
}
</script>
