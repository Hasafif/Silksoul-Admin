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
     // NEW: Temporary object for adding a new color variant
    newColorEntry: {
      name: '',        // e.g., "Red", "Sky Blue"
      hex: '#000000',  // The color code
      images: [],      // File objects for this specific color
      previewUrls: []  // Preview URLs for this color's images
    },
    // Add this to your data() return object
updateNewColorEntry: {
  name: '',
  hex: '#000000',
  images: [], // For File objects
  previewUrls: [],
},
    
    // MODIFIED: The main newProduct object
    newProduct: {
      name_english: "",
      name_arabic: "",
      description_english: "",
      description_arabic: "",
      price: "",
      quantities: [],
      sizes: [],
      categoryName_english: "",
      colors: [] // This will now store an array of color objects
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
      colors: [] // This will now store an array of color objects
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
    // REPLACE this method
openAddModal() {
  this.showAddModal = true;
  // Reset newProduct with the NEW structure
  this.newProduct = {
    name_english: "",
    name_arabic: "",
    description_english: "",
    description_arabic: "",
    price: "",
    quantities: [],
    sizes: [],
    categoryName_english: "",
    colors: [] // IMPORTANT: Initialize the new colors array
  };
  // Also reset the new temporary color entry form
  this.newColorEntry = {
    name: '',
    hex: '#000000',
    images: [],
    previewUrls: []
  };
  // Reset size entry as before
  this.newSizeEntry = {
    size: '',
    quantity: null
  };
  this.loadCategories();
},
onColorFileSelect(event) {
  const files = Array.from(event.target.files);
  // By removing the reset lines, we now ADD to the existing arrays
  files.forEach(file => {
    this.newColorEntry.images.push(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.newColorEntry.previewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  // Reset file input to allow selecting the same file again if needed
  event.target.value = '';
},
// Add this new method to your 'methods' object
removeNewColorImage(index) {
  this.newColorEntry.images.splice(index, 1);
  this.newColorEntry.previewUrls.splice(index, 1);
},
// Adds the temporary color entry to the main newProduct.colors array
addColor() {
  if (!this.newColorEntry.name.trim() || this.newColorEntry.images.length === 0) {
    alert("Please provide a color name and at least one image.");
    return;
  }
  
  // Push a copy of the new color entry to the product's colors array
  this.newProduct.colors.push({
    name: this.newColorEntry.name,
    hex: this.newColorEntry.hex,
    images: this.newColorEntry.images,
  });
  
  // Reset the temporary entry form
  this.newColorEntry = {
    name: '',
    hex: '#000000',
    images: [],
    previewUrls: []
  };
},

// Removes a color from the newProduct.colors array
removeColor(index) {
  this.newProduct.colors.splice(index, 1);
},
   // REPLACE this method
closeAddModal() {
  this.showAddModal = false;
  // Reset newProduct with the NEW structure
  this.newProduct = {
    name_english: '',
    name_arabic: '',
    description_english: '',
    description_arabic: '',
    price: null,
    sizes: [],
    quantities: [],
    categoryName_english: '',
    colors: [] // IMPORTANT: Initialize the new colors array
  };
  // Also reset the new temporary color entry form
  this.newColorEntry = {
    name: '',
    hex: '#000000',
    images: [],
    previewUrls: []
  };
  // Reset size entry as before
  this.newSizeEntry = {
    size: '',
    quantity: null
  };
},
    // REPLACE the old openUpdateModal method
openUpdateModal(product) {
  this.showUpdateModal = true;
  this.updateProduct = {
    id: product._id,
    name_english: product.name_english || "",
    name_arabic: product.name_arabic || "",
    description_english: product.description_english || "",
    description_arabic: product.description_arabic || "",
    price: product.price || "",
    sizes: [...(product.sizes || [])],
    quantities: [...(product.quantities || [])],
    categoryName_english: product.categoryName_english || "",
    // Deep copy the colors array and add placeholders for new files to be added to existing colors
    colors: JSON.parse(JSON.stringify(product.colors || [])).map(color => ({
      ...color,
      newImages: [], // For new File objects
      newPreviewUrls: [], // For their previews
    })),
  };

  // Reset the temporary form for adding a brand new color
  this.updateNewColorEntry = {
    name: '',
    hex: '#000000',
    images: [],
    previewUrls: []
  };

  this.loadCategories();
},
   closeUpdateModal() {
  this.showUpdateModal = false;
  this.updateProduct = {
    id: "",
    name_english: "",
    name_arabic: "",
    description_english: "",
    description_arabic: "",
    price: "", // Corrected
    sizes: [],
    quantities: [],
    categoryName_english: "",
    colors: [],
  };
  // Also reset the temporary entry form
  this.updateNewColorEntry = {
    name: '',
    hex: '#000000',
    images: [],
    previewUrls: []
  };
},
// ADD THESE NEW METHODS to your component's 'methods' object

// Handles adding more files to an EXISTING color
onUpdateFileSelect(event, colorIndex) {
  const files = Array.from(event.target.files);
  const color = this.updateProduct.colors[colorIndex];
  files.forEach(file => {
    color.newImages.push(file);
    const reader = new FileReader();
    reader.onload = (e) => color.newPreviewUrls.push(e.target.result);
    reader.readAsDataURL(file);
  });
  event.target.value = '';
},

// Removes an old, already-saved image
removeUpdateImage(colorIndex, imageIndex) {
  this.updateProduct.colors[colorIndex].images.splice(imageIndex, 1);
  this.updateProduct.colors[colorIndex].images_ids.splice(imageIndex, 1);
},

// Removes a new, unsaved image preview
removeNewUpdateImage(colorIndex, previewIndex) {
    this.updateProduct.colors[colorIndex].newImages.splice(previewIndex, 1);
    this.updateProduct.colors[colorIndex].newPreviewUrls.splice(previewIndex, 1);
},

// Removes an entire color variant
removeUpdateColor(colorIndex) {
  this.updateProduct.colors.splice(colorIndex, 1);
},

// --- Methods for adding a BRAND NEW color variant ---
onUpdateNewColorFileSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        this.updateNewColorEntry.images.push(file);
        const reader = new FileReader();
        reader.onload = (e) => this.updateNewColorEntry.previewUrls.push(e.target.result);
        reader.readAsDataURL(file);
    });
    event.target.value = '';
},

addUpdateColor() {
    if (!this.updateNewColorEntry.name.trim() || this.updateNewColorEntry.images.length === 0) return;
    this.updateProduct.colors.push({
        color: this.updateNewColorEntry.name,
        colorDeg: this.updateNewColorEntry.hex,
        images: [], images_ids: [],
        newImages: this.updateNewColorEntry.images,
        newPreviewUrls: this.updateNewColorEntry.previewUrls,
    });
    this.updateNewColorEntry = { name: '', hex: '#000000', images: [], previewUrls: [] };
},
    
   // REPLACE the old addProduct method with this one

async addProduct() {
  // --- Validation (add a check for colors) ---
  if (this.newProduct.colors.length === 0) {
    alert("Please add at least one color variant with images.");
    return;
  }
  // ... other validation for name, price, etc. ...

  this.isSubmitting = true;
  try {
    const formData = new FormData();
    
    // Append standard fields
    formData.append('name_english', this.newProduct.name_english.trim());
    formData.append('name_arabic', this.newProduct.name_arabic.trim());
    formData.append('description_english', this.newProduct.description_english.trim());
    formData.append('description_arabic', this.newProduct.description_arabic.trim());
    formData.append('price', this.newProduct.price);
    formData.append('quantity', parseInt(this.getTotalQuantity()));
    formData.append('categoryname', this.newProduct.categoryName_english.trim());

    // Append sizes and quantities correctly
    
    this.newProduct.sizes.forEach(size => formData.append('sizes', size));
    this.newProduct.quantities.forEach(qty => formData.append('quantities', qty));

    // --- NEW LOGIC FOR COLORS AND IMAGES ---
    // Iterate over the colors array to append data in the required format
    this.newProduct.colors.forEach((color, index) => {
      // 1. Append color metadata using indexed keys
      formData.append(`colors[${index}][color]`, color.name);
      formData.append(`colors[${index}][colorDeg]`, color.hex);
      
      // 2. Append image files with the special fieldname `color-INDEX`
      color.images.forEach(file => {
        formData.append(`color-${index}`, file);
      });
    });
   
    // Send the request
    await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: "post",
      url: "/admin/product/create",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    this.closeAddModal();
    await this.loadProducts();
    console.log("Product added successfully");

  } catch (e) {
    console.error(e);
    alert("Error adding product. Please check the console and try again.");
  } finally {
    this.isSubmitting = false;
  }
},

   // REPLACE the old updateProductSubmit method
async updateProductSubmit() {
  this.isSubmitting = true;
  try {
    const formData = new FormData();
    
    // 1. Append ALL simple fields
    formData.append('id', this.updateProduct.id);
    formData.append('name_english', this.updateProduct.name_english);
    formData.append('name_arabic', this.updateProduct.name_arabic); // ADD THIS
    formData.append('price', this.updateProduct.price); // ADD THIS
    formData.append('description_english', this.updateProduct.description_english); // ADD THIS
    formData.append('description_arabic', this.updateProduct.description_arabic); // ADD THIS
    formData.append('categoryname', this.updateProduct.categoryName_english); // ADD THIS
    
    // Append sizes and quantities
    this.updateProduct.sizes.forEach(s => formData.append('sizes', s));
    this.updateProduct.quantities.forEach(q => formData.append('quantities', q));

    // 2. Separate colors into existing and new
    const existingColors = this.updateProduct.colors.filter(c => c._id);
    const newColors = this.updateProduct.colors.filter(c => !c._id);

    // 3. Process and append EXISTING colors
    const cleanExistingColors = existingColors.map(color => {
      color.newImages.forEach(file => {
        formData.append(`existing-color-${color._id}`, file);
      });
      return { _id: color._id, color: color.color, colorDeg: color.colorDeg, images: color.images, images_ids: color.images_ids };
    });
    formData.append('existingColors', JSON.stringify(cleanExistingColors));

    // 4. Process and append NEW colors
    const cleanNewColors = newColors.map((color, index) => {
      color.newImages.forEach(file => {
        formData.append(`new-color-${index}`, file);
      });
      return { color: color.color, colorDeg: color.colorDeg };
    });
    formData.append('newColors', JSON.stringify(cleanNewColors));

    // 5. Make the API call
    await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: "put",
      url: "/admin/product/update",
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    this.closeUpdateModal();
    await this.loadProducts();
  } catch (e) {
    console.error(e);
    alert("Error updating product.");
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
      if (product.colors && product.colors.length > 0) {
        return product.colors[0].images[0];
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
    
<div class="form-control mb-4">
  <label class="label">
    <span class="label-text">Product Colors & Images *</span>
  </label>
  
  <div class="bg-gray-50 p-4 rounded-lg mb-4 border">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label"><span class="label-text-alt">Color Name</span></label>
        <input
          type="text"
          placeholder="e.g., Ocean Blue"
          class="input input-bordered w-full"
          v-model="newColorEntry.name"
        />
      </div>
      
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <label class="label"><span class="label-text-alt">Color Hex Code</span></label>
          <input
            type="text"
            placeholder="#0000FF"
            class="input input-bordered w-full font-mono text-sm"
            v-model="newColorEntry.hex"
          />
        </div>
        <input
          type="color"
          class="w-12 h-12 p-1 border border-gray-300 rounded cursor-pointer"
          v-model="newColorEntry.hex"
        />
      </div>
    </div>
    
    <div class="mt-4">
      <label class="label"><span class="label-text-alt">Images for this Color</span></label>
      <input
        type="file"
        multiple
        accept="image/*"
        class="file-input file-input-bordered w-full"
        @change="onColorFileSelect"
        :disabled="isSubmitting"
      />
    </div>
    
<div v-if="newColorEntry.previewUrls.length > 0" class="mt-3 grid grid-cols-3 gap-2">
  <div v-for="(url, index) in newColorEntry.previewUrls" :key="index" class="relative">
    <img :src="url" class="w-full h-20 object-cover rounded"/>
    <button
      type="button"
      @click="removeNewColorImage(index)"
      class="absolute top-1 right-1 btn btn-xs btn-circle bg-red-500 text-white hover:bg-red-600"
    >
      ✕
    </button>
  </div>
</div>
    
    <button
      type="button"
      @click="addColor"
      class="btn btn-primary btn-sm mt-4"
      :disabled="!newColorEntry.name.trim() || newColorEntry.images.length === 0"
    >
      Add Color Variant
    </button>
  </div>
  
  <div v-if="newProduct.colors.length > 0" class="space-y-3">
    <div class="text-sm text-gray-600">
      Added Variants ({{ newProduct.colors.length }}):
    </div>
    <div v-for="(color, index) in newProduct.colors" :key="index" class="flex items-center justify-between bg-white p-3 rounded-lg border">
      <div class="flex items-center gap-4">
        <div :style="{ backgroundColor: color.hex }" class="w-8 h-8 rounded-full border"></div>
        <div>
          <div class="font-bold">{{ color.name }}</div>
          <div class="text-xs text-gray-500">{{ color.images.length }} image(s)</div>
        </div>
      </div>
      <button
        type="button"
        @click="removeColor(index)"
        class="btn btn-ghost btn-sm btn-circle hover:bg-red-100"
        :disabled="isSubmitting"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  </div>
  <div v-else class="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
    No color variants added yet.
  </div>
</div>
    
    <div class="flex space-x-4">
      <button
        @click="addProduct"
        class="btn btn-primary"
        :disabled="isSubmitting || !newProduct.name_english.trim() || !newProduct.description_english.trim() || !newProduct.price || newProduct.sizes.length === 0 || !newProduct.categoryName_english.trim() || newProduct.colors.length===0"
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
        
       <div class="form-control mb-4">
    <label class="label"><span class="label-text font-bold">Manage Color Variants</span></label>
    <div v-if="updateProduct.colors.length > 0" class="space-y-4">
<div v-for="(color, colorIndex) in updateProduct.colors" :key="color._id || colorIndex" class="bg-gray-50 p-3 rounded-lg border">
<div class="flex justify-between items-center mb-2">
    <div class="flex items-center gap-3 flex-grow">
        <input 
            type="color" 
            v-model="color.colorDeg"
            class="p-0 w-8 h-8 border-none rounded cursor-pointer"
        />
        <input 
            type="text"
            v-model="color.color"
            class="input input-bordered input-sm w-full max-w-xs" 
        />
    </div>
    <button type="button" @click="removeUpdateColor(colorIndex)" class="btn btn-xs btn-error btn-outline ml-2">Remove Variant</button>
</div>
            
            <div class="text-xs mb-2">Images:</div>
            <div class="grid grid-cols-4 gap-2 mb-3">
                <div v-for="(img, imgIndex) in color.images" :key="img" class="relative">
                    <img :src="img" class="w-full h-16 object-cover rounded" />
                    <button type="button" @click="removeUpdateImage(colorIndex, imgIndex)" class="absolute top-1 right-1 btn btn-xs btn-circle bg-red-500 text-white">✕</button>
                </div>
                <div v-for="(url, previewIndex) in color.newPreviewUrls" :key="url" class="relative">
                    <img :src="url" class="w-full h-16 object-cover rounded border-2 border-primary" />
                     <button type="button" @click="removeNewUpdateImage(colorIndex, previewIndex)" class="absolute top-1 right-1 btn btn-xs btn-circle bg-red-500 text-white">✕</button>
                </div>
            </div>

            <input type="file" multiple @change="onUpdateFileSelect($event, colorIndex)" class="file-input file-input-bordered file-input-sm w-full" placeholder="Add more images..." />
        </div>
    </div>
</div>

<div class="form-control mb-4">
    <label class="label"><span class="label-text font-bold">Add New Color Variant</span></label>
<div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="label"><span class="label-text-alt">New Color Name</span></label>
            <input type="text" placeholder="e.g., Forest Green" class="input input-bordered w-full" v-model="updateNewColorEntry.name" />
        </div>
        <div class="flex items-end gap-3">
            <div class="flex-1">
                <label class="label"><span class="label-text-alt">Hex Code</span></label>
                <input type="text" placeholder="#228B22" class="input input-bordered w-full" v-model="updateNewColorEntry.hex" />
            </div>
            <input type="color" class="w-12 h-12 p-1 border rounded" v-model="updateNewColorEntry.hex" />
        </div>
    </div>
    <div class="mt-4">
        <label class="label"><span class="label-text-alt">Images for New Color</span></label>
        <input type="file" multiple class="file-input file-input-bordered w-full" @change="onUpdateNewColorFileSelect" />
    </div>
    <div v-if="updateNewColorEntry.previewUrls.length > 0" class="mt-3 grid grid-cols-3 gap-2">
        <img v-for="url in updateNewColorEntry.previewUrls" :src="url" class="w-full h-20 object-cover rounded" />
    </div>
    <button type="button" @click="addUpdateColor" class="btn btn-primary btn-sm mt-4" :disabled="!updateNewColorEntry.name.trim() || updateNewColorEntry.images.length === 0">
        Add This New Variant
    </button>
</div>
</div>
        <div class="flex space-x-4">
          <button
            @click="updateProductSubmit"
            class="btn btn-warning"
            :disabled="isSubmitting || !updateProduct.name_english.trim() || !updateProduct.name_arabic ||
            !updateProduct.description_english.trim() ||!updateProduct.description_arabic.trim()|| !updateProduct.price || !updateProduct.quantities || !updateProduct.sizes || !updateProduct.categoryName_english.trim() || !updateProduct.colors
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