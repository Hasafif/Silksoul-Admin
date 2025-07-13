<script>
import axios from "axios";

export default {
  props: {
    categoryID: String,
    categoryKey: Number,
  },
  data() {
    return {
      category: {},
      dataLoaded: false,
    };
  },

  methods: {
    async showCategory() {
      try {
        const category = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/category/show",
          params: {
            id: this.categoryID,
          },
        });
        

        this.category = category.data;
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
    :for="'showCategory' + this.categoryKey"
    class="btn btn-primary btn-outline"
    @click="showCategory()"
    >Show</label
  >
  <input type="checkbox" :id="'showCategory' + this.categoryKey" class="modal-toggle" />
  <div class="modal" v-if="dataLoaded">
    <div class="modal-box w-11/12 max-w-5xl">
      <label
        :for="'showCategory' + this.categoryKey"
        class="btn btn-sm btn-circle absolute right-2 top-2"
        >✕</label
      >
      <h3 class="font-bold text-lg">{{ this.category.name }}</h3>
      <div class="divider"></div>

      <div>
        <div class="flex flex-col flex-wrap gap-4">
          <div class="whitespace-normal">{{ this.category.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
