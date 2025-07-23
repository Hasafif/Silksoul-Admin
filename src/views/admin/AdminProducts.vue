<script>
import axios from "axios";
import ShowProduct from "@/components/admin/ShowProduct.vue";

export default {
  components: { ShowProduct },

  data() {
    return {
      products: {},
      searchQuery: "",
      showAddModal: false,
      showUpdateModal: false,
      // Available sizes for selection
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'],
      
      // Temporary object for adding new size/quantity pairs
      newSizeEntry: {
        size: '',
        quantity: null
      },
      newProduct: {
        name_english: "",
        name_arabic: "",
        description_english: "",
        description_arabic: "",
        price: "",
        quantities: [],
        sizes: [],
        categoryName_english: "",
        color: "#00000", // Default color
        images: [] // Will store File objects
      },
      updateProduct: {
        id: "",
        name_english: "",
        name_arabic: "",
        description_english: "",
        description_arabic: "",
        price: "",
         quantities: [],
        sizes: [],
        categoryName_english: "",
        color: "#000000",
        images: [],
        existingImages: [] // Store existing images from server
      },
      categories: [],
      isLoading: false,
      isSubmitting: false,
      isLoadingCategories: false,
      imagePreviewUrls: [], // For displaying image previews
      updateImagePreviewUrls: [] // For update modal image previews
    };
  },

  computed: {
    filteredProducts() {
      if (!this.searchQuery) {
        return this.products;
      }
      
      const query = this.searchQuery.toLowerCase();
      const filtered = {};
      
      Object.keys(this.products).forEach(key => {
        const product = this.products[key];
        if (product.name_english && product.name_english.toLowerCase().includes(query)) {
          filtered[key] = product;
        }
      });
      
      return filtered;
    }
  },

  async created() {
    await this.loadProducts();
  },

  methods: {
    async loadProducts() {
      this.isLoading = true;
      try {
        const products = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/list",
        });
        this.products = products.data;
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },

    async loadCategories() {
      this.isLoadingCategories = true;
      try {
        const categories = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/category/list",
        });
        this.categories = categories.data;
      } catch (e) {
        console.log(e);
        alert("Error loading categories. Please try again.");
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async deleteProduct(productID) {
      try {
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "delete",
          url: "/admin/product/delete",
          params: {
            id: productID,
          },
        });

        // Refresh the products list instead of reloading the whole page
        await this.loadProducts();
      } catch (e) {
        console.log(e);
      }
    },
// Add size and quantity pair
    addSizeQuantity() {
      if (!this.newSizeEntry.size || !this.newSizeEntry.quantity || this.newSizeEntry.quantity <= 0) {
        return;
      }
     
      // Check if size already exists
      const existingIndex = this.newProduct.sizes.indexOf(this.newSizeEntry.size);
      if (existingIndex !== -1) {
        // Update existing size quantity
        this.newProduct.quantities[existingIndex] = parseInt(this.newSizeEntry.quantity);
        alert(`Updated quantity for size ${this.newSizeEntry.size}`);
      } else {
        // Add new size and quantity
        this.newProduct.sizes.push(this.newSizeEntry.size);
        this.newProduct.quantities.push(parseInt(this.newSizeEntry.quantity));
      }
      
      // Reset the input fields
      this.newSizeEntry = {
        size: '',
        quantity: null
      };
    },
    
    // Remove size and quantity pair
    removeSizeQuantity(index) {
      this.newProduct.sizes.splice(index, 1);
      this.newProduct.quantities.splice(index, 1);
    },
    updateSizeQuantity() {
      if (!this.newSizeEntry.size || !this.newSizeEntry.quantity || this.newSizeEntry.quantity <= 0) {
        return;
      }
     
      // Check if size already exists
      const existingIndex = this.updateProduct.sizes.indexOf(this.newSizeEntry.size);
      if (existingIndex !== -1) {
        // Update existing size quantity
        this.updateProduct.quantities[existingIndex] = parseInt(this.newSizeEntry.quantity);
        alert(`Updated quantity for size ${this.newSizeEntry.size}`);
      } else {
        // Add new size and quantity
        this.updateProduct.sizes.push(this.newSizeEntry.size);
        this.updateProduct.quantities.push(parseInt(this.newSizeEntry.quantity));
      }
      
      // Reset the input fields
      this.newSizeEntry = {
        size: '',
        quantity: null
      };
    },
    
    // Remove size and quantity pair
    removeupdateSizeQuantity(index) {
      this.updateProduct.sizes.splice(index, 1);
      this.updateProduct.quantities.splice(index, 1);
    },
    getTotalQuantity() {
  return this.newProduct.quantities.reduce((total, qty) => total + qty, 0);
},
 getupdateTotalQuantity() {
  return this.updateProduct.quantities.reduce((total, qty) => total + qty, 0);
},
    openAddModal() {
      this.showAddModal = true;
      this.newProduct = {
        name_english: "",
         name_arabic: "",
        description_english: "",
         description_arabic: "",
        price: "",
        quantities: [],
        sizes:[],
        categoryName_english: "",
        color: "#000000", // Reset to default color
        images: []
      };
        this.newSizeEntry = {
        size: '',
        quantity: null
      };
      this.imagePreviewUrls = [];
      this.loadCategories();
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newProduct = {
        name_english: '',
        name_arabic: '',
        description_english: '',
        description_arabic: '',
        price: null,
        sizes: [],
        quantities: [],
        categoryName_english: '',
        color: '#000000',
        images: []
      };
      this.newSizeEntry = {
        size: '',
        quantity: null
      };
      this.imagePreviewUrls = [];
      
    },
    openUpdateModal(product) {
      this.showUpdateModal = true;
      this.updateProduct = {
        id: product._id,
        name_english: product.name_english || "",
        name_arabic: product.name_arabic || "",
        description_english: product.description_english || "",
        description_arabic: product.description_arabic || "",
        price: product.price || "",
        sizes:product.sizes || [],
        quantities: product.quantities || [],
        categoryName_english: product.categoryName_english || "",
        color: product.color || "#000000",
        images: [],
        existingImages: product.images || [],
        existingImages_ids: product.images_ids || [],
      };
        this.newSizeEntry = {
        size: '',
        quantity: null
      };
      this.updateImagePreviewUrls = [];
      this.loadCategories();
    },

    closeUpdateModal() {
      this.showUpdateModal = false;
      this.updateProduct = {
        id: "",
        name_english: "",
        name_arabic:"",
        description_english: "",
        description_arabic: "",
        price: "",
        sizes: [],
        quantities: [],
        categoryName_english: "",
        color: "#000000",
        images: [],
        existingImages: [],
        existingImages_ids: [],
      };
      this.updateImagePreviewUrls = [];
    },

    // Handle file selection for add modal
    onFileSelect(event) {
      const files = Array.from(event.target.files);
      
      files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file`);
          return;
        }
        
        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          return;
        }
        
        // Add file to images array
        this.newProduct.images.push(file);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset file input
      event.target.value = '';
    },

    // Handle file selection for update modal
    onUpdateFileSelect(event) {
      const files = Array.from(event.target.files);
      
      files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file`);
          return;
        }
        
        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          return;
        }
        
        // Add file to images array
        this.updateProduct.images.push(file);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.updateImagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset file input
      event.target.value = '';
    },

    // Remove image from selection (add modal)
    removeImage(index) {
      this.newProduct.images.splice(index, 1);
      this.imagePreviewUrls.splice(index, 1);
    },

    // Remove new image from update modal
    removeUpdateImage(index) {
      this.updateProduct.images.splice(index, 1);
      this.updateImagePreviewUrls.splice(index, 1);
    },

    // Remove existing image from update modal
    removeExistingImage(index) {
      this.updateProduct.existingImages.splice(index, 1);
      this.updateProduct.existingImages_ids.splice(index, 1);
    },

    async addProduct() {
      console.log(this.newProduct.images);
      
      if (!this.newProduct.name_english.trim() || !this.newProduct.name_arabic.trim()) {
        alert("Please enter a product name");
        return;
      }

      if (!this.newProduct.description_english.trim() || !this.newProduct.description_arabic.trim()) {
        alert("Please enter a product description");
        return;
      }

      if (!this.newProduct.price || this.newProduct.price <= 0) {
        alert("Please enter a valid price");
        return;
      }

      if (!this.newProduct.quantities || this.newProduct.quantities < 0) {
        alert("Please enter a valid quantity");
        return;
      }
    if (!this.newProduct.sizes || this.newProduct.sizes < 0) {
        alert("Please enter a valid quantity");
        return;
      }
      if (!this.newProduct.categoryName_english.trim()) {
        alert("Please select a category");
        return;
      }

      if (!this.newProduct.color) {
        alert("Please select a color");
        return;
      }

      this.isSubmitting = true;
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name_english', this.newProduct.name_english.trim());
        formData.append('name_arabic', this.newProduct.name_arabic.trim());
        formData.append('description_english', this.newProduct.description_english.trim());
        formData.append('description_arabic', this.newProduct.description_arabic.trim());
        formData.append('price', this.newProduct.price);
        formData.append('quantity', parseInt(this.getTotalQuantity()));
        formData.append('categoryname', this.newProduct.categoryName_english.trim());
        formData.append('color', this.newProduct.color);
        
        // Append each image file
        this.newProduct.images.forEach((file, index) => {
          formData.append('images', file);
          
        });
        formData.append('sizes', '');
        formData.append('sizes', '');
         this.newProduct.sizes.forEach((size, index) => {
          formData.append('sizes', size);
        });
        formData.append('quantities', '');
        formData.append('quantities', '');
         this.newProduct.quantities.forEach((quantity, index) => {
          formData.append('quantities', quantity);
        });
        // Debug: Check what's being sent
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        console.log('FormData object:', formData);
        console.log('FormData instanceof FormData:', formData instanceof FormData);
        
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "post",
          url: "/admin/product/create",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Close modal and refresh products
        this.closeAddModal();
        await this.loadProducts();
        
        console.log("Product added successfully");
      } catch (e) {
        console.log(e);
        alert("Error adding product. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateProductSubmit() {
      if (!this.updateProduct.name_english.trim() || !this.updateProduct.name_arabic.trim()) {
        alert("Please enter a product name");
        return;
      }

      if (!this.updateProduct.description_english.trim() || !this.updateProduct.description_arabic.trim()) {
        alert("Please enter a product description");
        return;
      }

      if (!this.updateProduct.price || this.updateProduct.price <= 0) {
        alert("Please enter a valid price");
        return;
      }

      if (!this.updateProduct.quantities || this.updateProduct.quantities < 0) {
        alert("Please enter a valid quantity");
        return;
      }
 if (!this.updateProduct.sizes || this.updateProduct.sizes < 0) {
        alert("Please enter a valid quantity");
        return;
      }
      if (!this.updateProduct.categoryName_english.trim()) {
        alert("Please select a category");
        return;
      }

      if (!this.updateProduct.color) {
        alert("Please select a color");
        return;
      }

      this.isSubmitting = true;
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('id', this.updateProduct.id);
        formData.append('name_english', this.updateProduct.name_english.trim());
        formData.append('name_arabic', this.updateProduct.name_arabic.trim());
        formData.append('description_english', this.updateProduct.description_english.trim());
        formData.append('description_arabic', this.updateProduct.description_arabic.trim());
        formData.append('price', this.updateProduct.price);
        formData.append('categoryname', this.updateProduct.categoryName_english.trim());
        formData.append('color', this.updateProduct.color);
        formData.append('quantity', parseInt(this.getupdateTotalQuantity()));

        // Append existing images that weren't removed
        //formData.append('existingImages', this.updateProduct.existingImages);
         // Append new image files
         formData.append('existingImages', '');
         formData.append('existingImages', '');
         this.updateProduct.existingImages.forEach((file,index) => {
          formData.append('existingImages', file);
        });
        // Append new image files
        this.updateProduct.images.forEach((file, index) => {
          formData.append('images', file);
        });
         formData.append('existingImages_ids', '');
         formData.append('existingImages_ids', '');
 this.updateProduct.existingImages_ids.forEach((id, index) => {
          formData.append('existingImages_ids', id);
        });
        formData.append('sizes', '');
        formData.append('sizes', '');
          this.updateProduct.sizes.forEach((size, index) => {
          formData.append('sizes', size);
        });
        formData.append('quantities','');
        formData.append('quantities','');
        this.updateProduct.quantities.forEach((quantity, index) => {
          formData.append('quantities',quantity);
        });
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "put",
          url: "/admin/product/update",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Close modal and refresh products
        this.closeUpdateModal();
        await this.loadProducts();
        
        console.log("Product updated successfully");
      } catch (e) {
        console.log(e);
        alert("Error updating product. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },

    clearSearch() {
      this.searchQuery = "";
    },

    formatPrice(price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AED'
      }).format(price);
    },

    getStockStatus(quantity) {
      if (quantity === 0) return { text: 'Out of Stock', class: 'badge-error' };
      if (quantity <= 5) return { text: 'Low Stock', class: 'badge-warning' };
      return { text: 'In Stock', class: 'badge-success' };
    },

    getCoverImage(product) {
      if (product.images && product.images.length > 0) {
        return product.images[0];
      }
      return null;
    },

    onImageError(event) {
      // Hide the image if it fails to load
      event.target.style.display = 'none';
      // Show the fallback placeholder
      event.target.nextElementSibling.style.display = 'flex';
    }
  },
};
</script>

<template>
  <main>
    <div class="w-full p-8">
      <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between">
        <h2 class="font-bold text-2xl">Products</h2>
        <button @click="openAddModal" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>
      
      <!-- Search Bar -->
      <div class="mt-4 mb-4">
        <div class="form-control w-full max-w-md">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search products..."
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
      
      <!-- Products Table -->
      <div v-else class="overflow-x-auto">
        <table class="table w-full">
          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th>Cover Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Color</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="Object.keys(filteredProducts).length === 0"
              class="text-center"
            >
              <td colspan="8" class="text-gray-500 py-8">
                {{ searchQuery ? 'No products found matching your search.' : 'No products available.' }}
              </td>
            </tr>
            <tr
              class="hover"
              v-for="(product, key) in filteredProducts"
              :key="key"
            >
              <td>{{ key + 1 }}</td>
              
              <!-- Cover Image Column -->
              <td>
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                  <img
                    v-if="getCoverImage(product)"
                    :src="getCoverImage(product)"
                    :alt="product.name_english"
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <div
                    class="w-full h-full bg-gray-200 flex items-center justify-center"
                    :style="{ display: getCoverImage(product) ? 'none' : 'flex' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </td>
           
              <td>
                <div class="font-bold">{{ product.name_english }}</div>
              </td>
              <td>
                <div class="font-semibold">{{ formatPrice(product.price) }}</div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ product.quantity }}</span>
                </div>
              </td>
              <td>
                <div class="font-medium">{{ product.categoryName_english }}</div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div 
                    class="w-6 h-6 rounded-full border-2 border-gray-300"
                    :style="{ backgroundColor: product.color || '#000000' }"
                  ></div>
                  <span class="text-sm font-mono">{{ product.color || '#000000' }}</span>
                </div>
              </td>
              <td class="flex space-x-2">
                <button 
                  @click="openUpdateModal(product)"
                  class="btn btn-warning btn-outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </button>
                <label :for="'deleteProduct' + key" class="btn btn-error btn-outline">
                  Delete
                </label>
              
              </td>
              
              <!-- Delete Confirmation Modal -->
              <input
                type="checkbox"
                :id="'deleteProduct' + key"
                class="modal-toggle"
              />
              <div class="modal">
                <div class="modal-box relative">
                  <label
                    :for="'deleteProduct' + key"
                    class="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h3 class="font-bold text-lg">
                    Are you sure you want to delete this product - "{{ product.name_english }}"?
                  </h3>
                  <div class="divider"></div>
                  <div class="flex space-x-4">
                    <button
                      @click="deleteProduct(product._id)"
                      class="btn btn-error btn-outline"
                    >
                      Delete
                    </button>
                    <label :for="'deleteProduct' + key" class="btn btn-primary">
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

   <!-- Add Product Modal -->
<div v-if="showAddModal" class="modal modal-open">
  <div class="modal-box relative max-w-2xl">
    <button
      @click="closeAddModal"
      class="btn btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </button>
    <h3 class="font-bold text-lg mb-4">Add New Product</h3>
    
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Product Name *</span>
      </label>
      <input
        type="text"
        placeholder="Enter product name"
        class="input input-bordered w-full"
        v-model="newProduct.name_english"
        :disabled="isSubmitting"
      />
    </div>
    <div class="form-control mb-4" dir="rtl">
      <label class="label">
        <span class="label-text">اسم المنتج *</span>
      </label>
      <input
        type="text"
        placeholder="ادخل اسم المنتج"
        class="input input-bordered w-full"
        v-model="newProduct.name_arabic"
        :disabled="isSubmitting"
      />
    </div>
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Description *</span>
      </label>
      <textarea
        placeholder="Enter product description"
        class="textarea textarea-bordered w-full"
        rows="3"
        v-model="newProduct.description_english"
        :disabled="isSubmitting"
      ></textarea>
    </div>
    <div class="form-control mb-4" dir="rtl">
      <label class="label">
        <span class="label-text"> * الوصف</span>
      </label>
      <textarea
        placeholder="ادخل وصف المنتج"
        class="textarea textarea-bordered w-full"
        rows="3"
        v-model="newProduct.description_arabic"
        :disabled="isSubmitting"
      ></textarea>
    </div>
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Price (AED) *</span>
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="Enter price"
        class="input input-bordered w-full"
        v-model="newProduct.price"
        :disabled="isSubmitting"
      />
    </div>
    
    <!-- Size and Quantity Section -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Sizes and Quantities *</span>
      </label>
      
      <!-- Add Size/Quantity Row -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="label">
              <span class="label-text-alt">Size</span>
            </label>
            <select
              class="select select-bordered w-full"
              v-model="newSizeEntry.size"
              :disabled="isSubmitting"
            >
              <option value="">Select size</option>
              <option v-for="size in availableSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="label">
              <span class="label-text-alt">Quantity</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter quantity"
              class="input input-bordered w-full"
              v-model="newSizeEntry.quantity"
              :disabled="isSubmitting"
            />
          </div>
          <button
            type="button"
            @click="addSizeQuantity"
            class="btn btn-primary"
            :disabled="isSubmitting || !newSizeEntry.size || !newSizeEntry.quantity || newSizeEntry.quantity <= 0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>
      
      <!-- Size/Quantity List -->
      <div v-if="newProduct.sizes.length > 0" class="space-y-2">
        <div class="text-sm text-gray-600 mb-2">
          Added Sizes ({{ newProduct.sizes.length }}):
        </div>
        <div class="space-y-2">
          <div
            v-for="(size, index) in newProduct.sizes"
            :key="index"
            class="flex items-center justify-between bg-white p-3 rounded-lg border"
          >
            <div class="flex items-center gap-4">
              <div class="badge badge-primary badge-lg">{{ size }}</div>
              <div class="text-sm">
                <span class="font-medium">Quantity:</span> {{ newProduct.quantities[index] }}
              </div>
            </div>
            <button
              type="button"
              @click="removeSizeQuantity(index)"
              class="btn btn-ghost btn-sm btn-circle hover:bg-red-100 hover:text-red-600"
              :disabled="isSubmitting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- No Sizes Message -->
      <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
        No sizes added yet. Select a size and enter quantity above.
      </div>
    </div>
    
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Category *</span>
      </label>
      <select
        class="select select-bordered w-full"
        v-model="newProduct.categoryName_english"
        :disabled="isSubmitting || isLoadingCategories"
      >
        <option value="">
          {{ isLoadingCategories ? 'Loading categories...' : 'Select a category' }}
        </option>
        <option
          v-for="category in categories"
          :key="category._id || category.id"
          :value="category.name_english"
        >
          {{ category.name_english }}
        </option>
      </select>
    </div>
    
    <!-- Color Input Field -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Color *</span>
      </label>
      <div class="flex items-center gap-3">
        <input
          type="color"
          class="w-16 h-12 border border-gray-300 rounded cursor-pointer"
          v-model="newProduct.color"
          :disabled="isSubmitting"
        />
        <div class="flex-1">
          <input
            type="text"
            placeholder="#000000"
            class="input input-bordered w-full font-mono text-sm"
            v-model="newProduct.color"
            :disabled="isSubmitting"
            pattern="^#[0-9A-Fa-f]{6}$"
            title="Please enter a valid hex color code (e.g., #FF0000)"
          />
        </div>
      </div>
      <label class="label">
        <span class="label-text-alt">Select a color or enter hex code</span>
      </label>
    </div>
    
    <!-- Image Upload Section -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Product Images</span>
      </label>
      
      <!-- File Input -->
      <div class="mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          class="file-input file-input-bordered w-full"
          @change="onFileSelect"
          :disabled="isSubmitting"
        />
        <div class="label">
          <span class="label-text-alt">Select multiple images (max 5MB each)</span>
        </div>
      </div>
      
      <!-- Image Previews -->
      <div v-if="newProduct.images.length > 0" class="space-y-3">
        <div class="text-sm text-gray-600 mb-2">
          Selected Images ({{ newProduct.images.length }}):
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(image, index) in newProduct.images"
            :key="index"
            class="relative bg-gray-50 rounded-lg p-3 border"
          >
            <!-- Image Preview -->
            <div class="w-full h-24 rounded overflow-hidden bg-gray-200 mb-2">
              <img
                :src="imagePreviewUrls[index]"
                :alt="`Preview ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- File Info -->
            <div class="text-xs text-gray-600 mb-2">
              <div class="truncate font-medium">{{ image.name }}</div>
              <div>{{ (image.size / 1024).toFixed(1) }} KB</div>
            </div>
            
            <!-- Remove Button -->
            <button
              type="button"
              @click="removeImage(index)"
              class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
              :disabled="isSubmitting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- No Images Message -->
      <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
        No images selected. Click "Choose Files" to upload product images.
      </div>
    </div>
    
    <div class="flex space-x-4">
      <button
        @click="addProduct"
        class="btn btn-primary"
        :disabled="isSubmitting || !newProduct.name_english.trim() || !newProduct.description_english.trim() || !newProduct.price || newProduct.sizes.length === 0 || !newProduct.categoryName_english.trim() || !newProduct.color"
      >
        <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
        {{ isSubmitting ? 'Adding...' : 'Add Product' }}
      </button>
      <button
        @click="closeAddModal"
        class="btn btn-outline"
        :disabled="isSubmitting"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

    <!-- Update Product Modal -->
    <div v-if="showUpdateModal" class="modal modal-open">
      <div class="modal-box relative max-w-2xl">
        <button
          @click="closeUpdateModal"
          class="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">Update Product</h3>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Product Name *</span>
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            class="input input-bordered w-full"
            v-model="updateProduct.name_english"
            :disabled="isSubmitting"
          />
        </div>
 <div class="form-control mb-4" dir="rtl">
          <label class="label">
            <span class="label-text">اسم المنتج *</span>
          </label>
          <input
            type="text"
            placeholder="ادخل اسم المنتج"
            class="input input-bordered w-full"
            v-model="updateProduct.name_arabic"
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Description *</span>
          </label>
          <textarea
            placeholder="Enter product description"
            class="textarea textarea-bordered w-full"
            rows="3"
            v-model="updateProduct.description_english"
            :disabled="isSubmitting"
          ></textarea>
        </div>
         <div class="form-control mb-4" dir="rtl">
          <label class="label">
            <span class="label-text">الوصف *</span>
          </label>
          <textarea
            placeholder="ادخل وصف المنتج"
            class="textarea textarea-bordered w-full"
            rows="3"
            v-model="updateProduct.description_arabic"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Price (AED) *</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter price"
            class="input input-bordered w-full"
            v-model="updateProduct.price"
            :disabled="isSubmitting"
          />
        </div>
        
         <!-- Size and Quantity Section -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">Sizes and Quantities *</span>
      </label>
      
      <!-- Add Size/Quantity Row -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="label">
              <span class="label-text-alt">Size</span>
            </label>
            <select
              class="select select-bordered w-full"
              v-model="newSizeEntry.size"
              :disabled="isSubmitting"
            >
              <option value="">Select size</option>
              <option v-for="size in availableSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="label">
              <span class="label-text-alt">Quantity</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter quantity"
              class="input input-bordered w-full"
              v-model="newSizeEntry.quantity"
              :disabled="isSubmitting"
            />
          </div>
          <button
            type="button"
            @click="updateSizeQuantity"
            class="btn btn-primary"
            :disabled="isSubmitting || !newSizeEntry.size || !newSizeEntry.quantity || newSizeEntry.quantity <= 0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>
      
      <!-- Size/Quantity List -->
      <div v-if="updateProduct.sizes.length > 0" class="space-y-2">
        <div class="text-sm text-gray-600 mb-2">
          Added Sizes ({{ updateProduct.sizes.length }}):
        </div>
        <div class="space-y-2">
          <div
            v-for="(size, index) in updateProduct.sizes"
            :key="index"
            class="flex items-center justify-between bg-white p-3 rounded-lg border"
          >
            <div class="flex items-center gap-4">
              <div class="badge badge-primary badge-lg">{{ size }}</div>
              <div class="text-sm">
                <span class="font-medium">Quantity:</span> {{ updateProduct.quantities[index] }}
              </div>
            </div>
            <button
              type="button"
              @click="removeupdateSizeQuantity(index)"
              class="btn btn-ghost btn-sm btn-circle hover:bg-red-100 hover:text-red-600"
              :disabled="isSubmitting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- No Sizes Message -->
      <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
        No sizes added yet. Select a size and enter quantity above.
      </div>
    </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Category *</span>
          </label>
          <select
            class="select select-bordered w-full"
            v-model="updateProduct.categoryName_english"
            :disabled="isSubmitting || isLoadingCategories"
          >
            <option value="">
              {{ isLoadingCategories ? 'Loading categories...' : 'Select a category' }}
            </option>
            <option
              v-for="category in categories"
              :key="category._id || category.id"
              :value="category.name_english"
            >
              {{ category.name_english }}
            </option>
          </select>
        </div>
        
        <!-- Color Input Field -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Color *</span>
          </label>
          <div class="flex items-center gap-3">
            <input
              type="color"
              class="w-16 h-12 border border-gray-300 rounded cursor-pointer"
              v-model="updateProduct.color"
              :disabled="isSubmitting"
            />
            <div class="flex-1">
              <input
                type="text"
                placeholder="#000000"
                class="input input-bordered w-full font-mono text-sm"
                v-model="updateProduct.color"
                :disabled="isSubmitting"
                pattern="^#[0-9A-Fa-f]{6}$"
                title="Please enter a valid hex color code (e.g., #FF0000)"
              />
            </div>
          </div>
          <label class="label">
            <span class="label-text-alt">Select a color or enter hex code</span>
          </label>
        </div>
        
        <!-- Image Upload Section -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Product Images</span>
          </label>
          
          <!-- Existing Images -->
          <div v-if="updateProduct.existingImages.length > 0" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">
              Current Images ({{ updateProduct.existingImages.length }}):
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(image, index) in updateProduct.existingImages"
                :key="'existing-' + index"
                class="relative bg-gray-50 rounded-lg p-3 border"
              >
                <!-- Image Preview -->
                <div class="w-full h-24 rounded overflow-hidden bg-gray-200 mb-2">
                  <img
                    :src="image"
                    :alt="`Existing ${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- File Info -->
                <div class="text-xs text-gray-600 mb-2">
                  <div class="truncate font-medium">Existing Image {{ index + 1 }}</div>
                </div>
                
                <!-- Remove Button -->
                <button
                  type="button"
                  @click="removeExistingImage(index)"
                  class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
                  :disabled="isSubmitting"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- File Input for New Images -->
          <div class="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="onUpdateFileSelect"
              :disabled="isSubmitting"
            />
            <div class="label">
              <span class="label-text-alt">Select additional images (max 5MB each)</span>
            </div>
          </div>
          
          <!-- New Image Previews -->
          <div v-if="updateProduct.images.length > 0" class="space-y-3">
            <div class="text-sm text-gray-600 mb-2">
              New Images ({{ updateProduct.images.length }}):
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(image, index) in updateProduct.images"
                :key="'new-' + index"
                class="relative bg-gray-50 rounded-lg p-3 border"
              >
                <!-- Image Preview -->
                <div class="w-full h-24 rounded overflow-hidden bg-gray-200 mb-2">
                  <img
                    :src="updateImagePreviewUrls[index]"
                    :alt="`New Preview ${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- File Info -->
                <div class="text-xs text-gray-600 mb-2">
                  <div class="truncate font-medium">{{ image.name }}</div>
                  <div>{{ (image.size / 1024).toFixed(1) }} KB</div>
                </div>
                
                <!-- Remove Button -->
                <button
                  type="button"
                  @click="removeUpdateImage(index)"
                  class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
                  :disabled="isSubmitting"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- No Images Message -->
          <div v-if="updateProduct.existingImages.length === 0 && updateProduct.images.length === 0" class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
            No images selected. Click "Choose Files" to upload product images.
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button
            @click="updateProductSubmit"
            class="btn btn-warning"
            :disabled="isSubmitting || !updateProduct.name_english.trim() || !updateProduct.name_arabic ||
            !updateProduct.description_english.trim() ||!updateProduct.description_arabic.trim()|| !updateProduct.price || !updateProduct.quantities || !updateProduct.sizes || !updateProduct.categoryName_english.trim() || !updateProduct.color
            "
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isSubmitting ? 'Updating...' : 'Update Product' }}
          </button>
          <button
            @click="closeUpdateModal"
            class="btn btn-outline"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </main>
</template>