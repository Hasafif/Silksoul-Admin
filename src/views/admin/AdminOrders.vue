<script>
import axios from "axios";
import ShowOrder from "@/components/admin/ShowOrder.vue";

export default {
  components: { ShowOrder },

  data() {
    return {
      orders: {},
      searchQuery: "",
      isLoading: false
    };
  },

  computed: {
    filteredOrders() {
      if (!this.searchQuery) {
        return this.orders;
      }
      
      const query = this.searchQuery.toLowerCase();
      const filtered = {};
      
      Object.keys(this.orders).forEach(key => {
        const order = this.orders[key];
        if (
          (order._id && order._id.toLowerCase().includes(query)) ||
          (order.status && order.status.toLowerCase().includes(query)) ||
          (order.total && order.total.toString().includes(query))
        ) {
          filtered[key] = order;
        }
      });
      
      return filtered;
    }
  },

  async created() {
    await this.loadOrders();
  },

  methods: {
    async loadOrders() {
      this.isLoading = true;
      try {
        const orders = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/order/list",
        });
        this.orders = orders.data
        console.log(orders.data);
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteOrder(orderID) {
      try {
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "delete",
          url: "/admin/order/delete",
          params: {
            orderID: orderID,
          },
        });

        // Refresh the orders list instead of reloading the whole page
        await this.loadOrders();
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
        <h2 class="font-bold text-2xl">Orders</h2>
      </div>
      
      <!-- Search Bar -->
      <div class="mt-4 mb-4">
        <div class="form-control w-full max-w-md">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search orders..."
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
              <th>Order ID</th>
              <th>Created At</th>
              <th>Total</th>
              <th>Status</th>
              <th>Customer Email</th>
              <th>Customer Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="Object.keys(filteredOrders).length === 0"
              class="text-center"
            >
              <td colspan="6" class="text-gray-500 py-8">
                {{ searchQuery ? 'No orders found matching your search.' : 'No orders available.' }}
              </td>
            </tr>
            <tr
              class="hover"
              v-for="(order, key) in filteredOrders"
              :key="key"
            >
              <td>{{ key + 1 }}</td>
              
              <!-- Order ID -->
              <td>
                <div class="font-mono text-sm">{{ order._id }}</div>
              </td>
              
              <!-- Created At -->
              <td>
                <div class="font-medium">{{ formatDate(order.createdAt) }}</div>
              </td>
              
              <!-- Total -->
              <td>
                <div class="font-semibold text-lg">{{ formatCurrency(order.totalAmount) }}</div>
              </td>
              
              <!-- Status -->
              <td>
                <div class="badge" :class="getStatusBadgeClass(order.paymentStatus)">
                  {{ order.paymentStatus || 'Unknown' }}
                </div>
              </td>
                 <!-- Total -->
              <td>
                <div class="font-semibold text-lg">{{ order.customerInfo.email }}</div>
              </td>
                  <td>
                <div class="font-semibold text-lg">{{ order.customerInfo.phone}}</div>
              </td>
              <!-- Actions -->
              <td class="flex space-x-2">
                <label :for="'deleteOrder' + key" class="btn btn-error btn-md">
                  Delete
                </label>
                <ShowOrder
                  :orderID="order._id"
                  :orderKey="key"
                ></ShowOrder>
              </td>
              
              <!-- Delete Confirmation Modal -->
              <input
                type="checkbox"
                :id="'deleteOrder' + key"
                class="modal-toggle"
              />
              <div class="modal">
                <div class="modal-box relative">
                  <label
                    :for="'deleteOrder' + key"
                    class="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h3 class="font-bold text-lg">
                    Are you sure you want to delete this order?
                  </h3>
                  <div class="mb-4">
                    <p class="text-sm text-gray-600">Order ID: {{ order._id }}</p>
                    <p class="text-sm text-gray-600">Total: {{ formatCurrency(order.totalAmount) }}</p>
                  </div>
                  <div class="divider"></div>
                  <div class="flex space-x-4">
                    <button
                      @click="deleteOrder(order._id)"
                      class="btn btn-error btn-outline"
                    >
                      Delete
                    </button>
                    <label :for="'deleteOrder' + key" class="btn btn-primary">
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