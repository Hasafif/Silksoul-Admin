<script>
import axios from "axios";

export default {
  props: {
    orderID: String,
    orderKey: Number,
  },
  data() {
    return {
      order: {},
      dataLoaded: false,
    };
  },

  methods: {
    async showOrder() {
      try {
        const order = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/order/show",
          params: {
            id: this.orderID,
          },
        });

        this.order = order.data;
        this.dataLoaded = true;
        // console.log(this.shop);
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<template>
  <label
    :for="'showOrder' + this.orderKey"
    class="btn btn-primary btn-outline"
    @click="showOrder()"
    >Show</label
  >
  <input type="checkbox" :id="'showOrder' + this.orderKey" class="modal-toggle" />
  <div class="modal" v-if="dataLoaded">
    <div class="modal-box w-11/12 max-w-5xl">
      <label
        :for="'showOrder' + this.orderKey"
        class="btn btn-sm btn-circle absolute right-2 top-2"
        >✕</label
      >
      <h3 class="font-bold text-lg">{{ this.order._id }}</h3>
      <div class="divider"></div>

      <div>
        <div class="flex flex-col flex-wrap gap-4">
          <div class="whitespace-normal">{{ this.order._id }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
