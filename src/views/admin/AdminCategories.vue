<script>
import axios from "axios";
import ShowCategory from "@/components/admin/ShowCategory.vue";

export default {
  components: { ShowCategory },

  data() {
    return {
      categories: [],
      searchQuery: "",
      showAddModal: false,
      showUpdateModal: false,
      newCategory: {
        name_english: "",
        name_arabic: "",
        products: [],
        image: null // Changed from images array to single image
      },
      updateCategory: {
        id: "",
        name_english: "",
        name_arabic: "",
        products: [],
        image: null,
        existingImage: null, // Store existing image from server
        existingImage_id: null
      },
      isLoading: false,
      isSubmitting: false,
      isLoadingCategories: false,
      imagePreviewUrl: null, // Changed from array to single URL
      updateImagePreviewUrl: null // For update modal image previews
    };
  },

  computed: {
    filteredCategories() {
      if (!this.searchQuery) {
        return this.categories;
      }
      
      const query = this.searchQuery.toLowerCase();
      
      // If categories is an array
      if (Array.isArray(this.categories)) {
        return this.categories.filter(category => 
          category.name_english && category.name_english.toLowerCase().includes(query)
        );
      }
      
      // If categories is an object
      const filtered = {};
      Object.keys(this.categories).forEach(key => {
        const category = this.categories[key];
        if (category.name_english && category.name_english.toLowerCase().includes(query)) {
          filtered[key] = category;
        }
      });
      
      return filtered;
    }
  },

  async created() {
    await this.loadCategories();
  },

  methods: {
    async loadCategories() {
      this.isLoading = true;
      try {
        const response = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/admin/product/category/list",
        });
        this.categories = response.data;
      } catch (e) {
        console.log(e);
        // You might want to show a toast notification here
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCategory(categoryID) {
      try {
        let res = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "delete",
          url: "/admin/product/category/delete",
          params: {
            id: categoryID,
          },
        });
        console.log(res.data)
        // Refresh the categories list instead of reloading the whole page
        await this.loadCategories();
      } catch (e) {
        console.log(e);
      }
    },

    openAddModal() {
      this.showAddModal = true;
      this.newCategory = {
        name_english: "",
        name_arabic: "",
        products: [],
        image: null
      };
      this.imagePreviewUrl = null; // Reset preview
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newCategory = {
        name_english: "",
        name_arabic: "",
        products: [],
        image: null
      };
      this.imagePreviewUrl = null; // Reset preview
    },

    openUpdateModal(category) {
      this.showUpdateModal = true;
      this.updateCategory = {
        id: category._id,
        name_english: category.name_english || "",
        name_arabic: category.name_arabic || "",
        products: category.products || [],
        image: null,
        existingImage: category.image || null,
        existingImage_id: category.image_id || null,
      };
      this.updateImagePreviewUrl = null;
    },

    closeUpdateModal() {
      this.showUpdateModal = false;
      this.updateCategory = {
        id: "",
        name_english: "",
        name_arabic: "",
        products: [],
        image: null,
        existingImage: null,
        existingImage_id: null,
      };
      this.updateImagePreviewUrl = null;
    },

    // Handle single file selection for add modal
    onFileSelect(event) {
      const file = event.target.files[0];
      
      if (!file) return;
      
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
      
      // Set the single image
      this.newCategory.image = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    // Handle file selection for update modal
    onUpdateFileSelect(event) {
      const file = event.target.files[0];
      
      if (!file) return;
      
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
      
      // Set the single image
      this.updateCategory.image = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.updateImagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Reset file input
      event.target.value = '';
    },

    // Remove the single image from add modal
    removeImage() {
      this.newCategory.image = null;
      this.imagePreviewUrl = null;
    },

    // Remove new image from update modal
    removeUpdateImage() {
      this.updateCategory.image = null;
      this.updateImagePreviewUrl = null;
    },

    // Remove existing image from update modal
    removeExistingImage() {
      this.updateCategory.existingImage = null;
      this.updateCategory.existingImage_id = null;
    },

    async addCategory() {
      if (!this.newCategory.name_english.trim() || !this.newCategory.name_arabic.trim()) {
        alert("Please enter a category name");
        return;
      }

      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('name_english', this.newCategory.name_english.trim());
        formData.append('name_arabic', this.newCategory.name_arabic.trim());
        
        // Append the single image if selected
        if (this.newCategory.image) {
          formData.append('image', this.newCategory.image);
        }
        
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "post",
          url: "/admin/product/category/create",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Close modal and refresh categories
        this.closeAddModal();
        await this.loadCategories();

        // You might want to show a success toast here
        console.log("Category added successfully");
      } catch (e) {
        console.log(e);
        // You might want to show an error toast here
        alert("Error adding category. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateCategorySubmit() {
      if (!this.updateCategory.name_english.trim()) {
        alert("Please enter a category name");
        return;
      }
      if (!this.updateCategory.name_arabic.trim()) {
        alert("Please enter a category name");
        return;
      }
      
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('id', this.updateCategory.id);
        formData.append('name_english', this.updateCategory.name_english.trim());
        formData.append('name_arabic', this.updateCategory.name_arabic.trim());
        
        // Append the single image if selected
        if (this.updateCategory.image) {
          formData.append('image', this.updateCategory.image);
        }
        
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "put",
          url: "/admin/product/category/update",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Close modal and refresh categories
        this.closeUpdateModal();
        await this.loadCategories();
        
        console.log("Category updated successfully");
      } catch (e) {
        console.log(e);
        alert("Error updating category. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },

    clearSearch() {
      this.searchQuery = "";
    },

    getCoverImage(category) {
      if (category.image) {
        return category.image;
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
        <h2 class="font-bold text-2xl">Categories</h2>
        <button @click="openAddModal" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>
      
      <!-- Search Bar -->
      <div class="mt-4 mb-4">
        <div class="form-control w-full max-w-md">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search categories..."
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
      
      <!-- Categories Table -->
      <div v-else class="overflow-x-auto">
        <table class="table w-full">
          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th>Cover Image</th>
              <th>Name</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="Object.keys(filteredCategories).length === 0"
              class="text-center"
            >
              <td colspan="4" class="text-gray-500 py-8">
                {{ searchQuery ? 'No categories found matching your search.' : 'No categories available.' }}
              </td>
            </tr>
            <tr
              class="hover"
              v-for="(category, key) in filteredCategories"
              :key="key"
            >
              <td>{{ key + 1 }}</td>
               <!-- Cover Image Column -->
              <td>
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                  <img
                    v-if="getCoverImage(category)"
                    :src="getCoverImage(category)"
                    :alt="category.name_english"
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <div
                    class="w-full h-full bg-gray-200 flex items-center justify-center"
                    :style="{ display: getCoverImage(category) ? 'none' : 'flex' }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </td>
              <td>{{ category.name_english }}</td>
              <td>{{ category.products.length }}</td>
              <td class="flex space-x-2">
                <button 
                  @click="openUpdateModal(category)"
                  class="btn btn-warning btn-outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </button>
                <label :for="'deleteCategory' + key" class="btn btn-error btn-outline">
                  Delete
                </label>
              </td>
              
              <!-- Delete Confirmation Modal -->
              <input
                type="checkbox"
                :id="'deleteCategory' + key"
                class="modal-toggle"
              />
              <div class="modal">
                <div class="modal-box relative">
                  <label
                    :for="'deleteCategory' + key"
                    class="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h3 class="font-bold text-lg">
                    Are you sure you want to delete this category - "{{ category.name_english }}"?
                  </h3>
                  <div class="divider"></div>
                  <div class="flex space-x-4">
                    <button
                      @click="deleteCategory(category._id)"
                      class="btn btn-error btn-outline"
                    >
                      Delete
                    </button>
                    <label :for="'deleteCategory' + key" class="btn btn-primary">
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

    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal modal-open">
      <div class="modal-box relative">
        <button
          @click="closeAddModal"
          class="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">Add New Category</h3>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Category Name *</span>
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            class="input input-bordered w-full"
            v-model="newCategory.name_english"
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-control mb-4" dir="rtl">
          <label class="label">
            <span class="label-text" dir="rtl">اسم الفئة *</span>
          </label>
          <input
            type="text"
            placeholder="ادخل اسم الفئة"
            class="input input-bordered w-full"
            v-model="newCategory.name_arabic"
            :disabled="isSubmitting"
          />
        </div>
        
        <!-- Single Image Upload Section -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Cover Image</span>
          </label>
          
          <!-- File Input -->
          <div class="mb-4">
            <input
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="onFileSelect"
              :disabled="isSubmitting"
            />
            <div class="label">
              <span class="label-text-alt">Select a single image (max 5MB)</span>
            </div>
          </div>
          
          <!-- Image Preview -->
          <div v-if="newCategory.image" class="bg-gray-50 rounded-lg p-4 border">
            <div class="text-sm text-gray-600 mb-2">Selected Image:</div>
            <div class="relative">
              <!-- Image Preview -->
              <div class="w-full h-48 rounded overflow-hidden bg-gray-200 mb-2">
                <img
                  :src="imagePreviewUrl"
                  :alt="newCategory.image.name"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- File Info -->
              <div class="text-xs text-gray-600 mb-2">
                <div class="truncate font-medium">{{ newCategory.image.name }}</div>
                <div>{{ (newCategory.image.size / 1024).toFixed(1) }} KB</div>
              </div>
              
              <!-- Remove Button -->
              <button
                type="button"
                @click="removeImage"
                class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
                :disabled="isSubmitting"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- No Image Message -->
          <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
            No image selected. Click "Choose File" to upload a cover image.
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button
            @click="addCategory"
            class="btn btn-primary"
            :disabled="isSubmitting || !newCategory.name_english.trim() || !newCategory.name_arabic.trim()"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isSubmitting ? 'Adding...' : 'Add Category' }}
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

    <!-- Update Category Modal -->
    <div v-if="showUpdateModal" class="modal modal-open">
      <div class="modal-box relative">
        <button
          @click="closeUpdateModal"
          class="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">Update Category</h3>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Category Name *</span>
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            class="input input-bordered w-full"
            v-model="updateCategory.name_english"
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-control mb-4" dir="rtl">
          <label class="label">
            <span class="label-text" dir="rtl">اسم الفئة *</span>
          </label>
          <input
            type="text"
            placeholder="ادخل اسم الفئة"
            class="input input-bordered w-full"
            v-model="updateCategory.name_arabic"
            :disabled="isSubmitting"
          />
        </div>
        
        <!-- Image Upload Section -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Cover Image</span>
          </label>
          
          <!-- Existing Image -->
          <div v-if="updateCategory.existingImage" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">Current Image:</div>
            <div class="relative bg-gray-50 rounded-lg p-3 border">
              <!-- Image Preview -->
              <div class="w-full h-32 rounded overflow-hidden bg-gray-200 mb-2">
                <img
                  :src="updateCategory.existingImage"
                  alt="Existing Image"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- File Info -->
              <div class="text-xs text-gray-600 mb-2">
                <div class="truncate font-medium">Current Image</div>
              </div>
              
              <!-- Remove Button -->
              <button
                type="button"
                @click="removeExistingImage"
                class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
                :disabled="isSubmitting"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- File Input for New Image -->
          <div class="mb-4">
            <input
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="onUpdateFileSelect"
              :disabled="isSubmitting"
            />
            <div class="label">
              <span class="label-text-alt">Select new image (max 5MB)</span>
            </div>
          </div>
          
          <!-- New Image Preview -->
          <div v-if="updateCategory.image" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">New Image:</div>
            <div class="relative bg-gray-50 rounded-lg p-3 border">
              <!-- Image Preview -->
              <div class="w-full h-32 rounded overflow-hidden bg-gray-200 mb-2">
                <img
                  :src="updateImagePreviewUrl"
                  alt="New Image Preview"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- File Info -->
              <div class="text-xs text-gray-600 mb-2">
                <div class="truncate font-medium">{{ updateCategory.image.name }}</div>
                <div>{{ (updateCategory.image.size / 1024).toFixed(1) }} KB</div>
              </div>
              
              <!-- Remove Button -->
              <button
                type="button"
                @click="removeUpdateImage"
                class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-red-500 hover:bg-red-600 text-white"
                :disabled="isSubmitting"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- No Images Message -->
          <div v-if="!updateCategory.existingImage && !updateCategory.image" class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
            No image selected. Click "Choose File" to upload a cover image.
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button
            @click="updateCategorySubmit"
            class="btn btn-primary"
            :disabled="isSubmitting || !updateCategory.name_english.trim() || !updateCategory.name_arabic.trim()"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isSubmitting ? 'Updating...' : 'Update Category' }}
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