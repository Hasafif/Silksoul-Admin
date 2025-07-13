<script>
import axios from "axios";
import showReview from "@/components/admin/ShowReview.vue";

export default {
  components: { showReview },

  data() {
    return {
      reviews: {},
      searchQuery: "",
      isLoading: false
    };
  },

  computed: {
    filteredReviews() {
      if (!this.searchQuery) {
        return this.reviews;
      }
      
      const query = this.searchQuery.toLowerCase();
      const filtered = {};
      
      Object.keys(this.reviews).forEach(key => {
        const review = this.reviews[key];
        if (
          (review._id && review._id.toLowerCase().includes(query)) ||
          (review.content && review.content.toLowerCase().includes(query)) ||
          (review.rating && review.rating.toString().includes(query))
        ) {
          filtered[key] = review;
        }
      });
      
      return filtered;
    }
  },

  async created() {
    await this.loadreviws();
  },

  methods: {
    async loadreviws() {
      this.isLoading = true;
      try {
        const reviews = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/review/list",
        });
        this.reviews = reviews.data;
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteReview(reviewID) {
      try {
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "delete",
          url: "/admin/product/review/delete",
          params: {
            reviewID: reviewID,
          },
        });

        // Refresh the orders list instead of reloading the whole page
        await this.loadreviws();
      } catch (e) {
        console.log(e);
      }
    },

    clearSearch() {
      this.searchQuery = "";
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusBadgeClass(status) {
      if (!status) return 'badge-ghost';
      
      const statusLower = status.toLowerCase();
      switch (statusLower) {
        case 'pending':
          return 'badge-warning';
        case 'processing':
          return 'badge-info';
        case 'shipped':
          return 'badge-primary';
        case 'delivered':
          return 'badge-success';
        case 'cancelled':
          return 'badge-error';
        default:
          return 'badge-ghost';
      }
    }
  },
};
</script>

<template>
  <main>
    <div class="w-full p-8">
      <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between">
        <h2 class="font-bold text-2xl">Reviews</h2>
      </div>
      
      <!-- Search Bar -->
      <div class="mt-4 mb-4">
        <div class="form-control w-full max-w-md">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search reviews..."
              class="input input-bordered w-full"
              v-model="searchQuery"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="btn btn-ghost btn-square"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button class="btn btn-ghost btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
      
      <!-- Orders Table -->
      <div v-else class="overflow-x-auto">
        <table class="table w-full">
          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th>Review ID</th>
              <th>Rating</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="Object.keys(filteredReviews).length === 0"
              class="text-center"
            >
              <td colspan="6" class="text-gray-500 py-8">
                {{ searchQuery ? 'No reviews found matching your search.' : 'No reviews available.' }}
              </td>
            </tr>
            <tr
              class="hover"
              v-for="(review, key) in filteredReviews"
              :key="key"
            >
              <td>{{ key + 1 }}</td>
              
              <!-- Review ID -->
              <td>
                <div class="font-mono text-sm">{{ review._id }}</div>
              </td>
              
              <!-- Rating -->
              <td>
                <div class="font-medium">{{ review.rating }}</div>
              </td>
              
              <!-- Content -->
              <td>
                <div class="font-semibold text-lg">{{ review.content }}</div>
              </td>
              
             
              <!-- Actions -->
              <td class="flex space-x-2">
                <label :for="'deleteReview' + key" class="btn btn-error btn-sm">
                  Delete
                </label>
                <showReview
                  :reviewID="order._id"
                  :reviewKey="key"
                ></showReview>
              </td>
              
              <!-- Delete Confirmation Modal -->
              <input
                type="checkbox"
                :id="'deleteReview' + key"
                class="modal-toggle"
              />
              <div class="modal">
                <div class="modal-box relative">
                  <label
                    :for="'deleteReview' + key"
                    class="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h3 class="font-bold text-lg">
                    Are you sure you want to delete this order?
                  </h3>
                  <div class="mb-4">
                    <p class="text-sm text-gray-600">Review ID: {{ review._id }}</p>
                    <p class="text-sm text-gray-600">Rating: {{ review.rating }}</p>
                  </div>
                  <div class="divider"></div>
                  <div class="flex space-x-4">
                    <button
                      @click="deleteReview(review._id)"
                      class="btn btn-error btn-outline"
                    >
                      Delete
                    </button>
                    <label :for="'deleteReview' + key" class="btn btn-primary">
                      Cancel
                    </label>
                  </div>
                </div>
              </div>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>