<script>
import axios from "axios";

export default {
  props: {
    reviewID: String,
    reviewKey: Number,
  },
  data() {
    return {
      review: {},
      dataLoaded: false,
    };
  },

  methods: {
    async showReview() {
      try {
        const review = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/review/show",
          params: {
            id: this.orderID,
          },
        });

        this.review = review.data;
        this.dataLoaded = true;
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<template>
  <label
    :for="'showReview' + this.reviewKey"
    class="btn btn-primary btn-outline"
    @click="showReview()"
    >Show</label
  >
  <input type="checkbox" :id="'showReview' + this.reviewKey" class="modal-toggle" />
  <div class="modal" v-if="dataLoaded">
    <div class="modal-box w-11/12 max-w-5xl">
      <label
        :for="'showReview' + this.reviewKey"
        class="btn btn-sm btn-circle absolute right-2 top-2"
        >✕</label
      >
      <h3 class="font-bold text-lg">{{ this.review.id }}</h3>
      <div class="divider"></div>

      <div>
        <div class="flex flex-col flex-wrap gap-4">
          <div class="whitespace-normal">{{ this.review.id }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
