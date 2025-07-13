<script>
import axios from "axios";
import ProductGrid from "@/components/ProductGrid.vue";

export default {
  components: { ProductGrid },

  data() {
    return {
      products: {},
      shops: {},
      categories: {},
      dataLoaded: false,
    };
  },

  async created() {
    try {
      const products = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: "get",
        url: "main/product/recent",
      });
      this.products = products.data;

      const shops = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: "get",
        url: "main/shop/recent",
      });
      this.shops = shops.data;

      const categories = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: "get",
        url: "main/category/all",
      });
      this.categories = categories.data;

      // console.table(this.products);
      // console.table(this.shops);
      // console.table(this.categories);

      this.dataLoaded = true;
    } catch (e) {
      console.log(e);
    }
  },

  methods: {
    trimText(text = "", n = 20) {
      return text.substring(0, n) + "...";
    },
  },
};
</script>

<template>
  <main class="flex flex-col space-y-4 p-2 md:p-0">
    <div class="hero bg-neutral py-20 rounded-md shadow-md">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold text-white">Hello there</h1>
          <p class="py-6 text-white">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <button class="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
    <!-- Recent Products -->
    <h2 class="font-bold text-2xl">Recent Products</h2>
    <ProductGrid :products="this.products"></ProductGrid>
    <!-- Categories -->
    <h2 class="font-bold text-2xl">Categories</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="(category, key) in this.categories"
        :key="key"
        class="card bg-neutral shadow-md"
      >
        <div class="card-body items-center justify-center">
          <router-link
            :to="'/category/' + category._id"
            class="card-title text-white hover:underline"
            >{{ category.name_english }}</router-link
          >
        </div>
      </div>
    </div>
  </main>
</template>
