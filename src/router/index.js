import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
   /* {
      path: "/register",
      name: "Register",
      component: () => import("../views/RegisterView.vue"),
    },*/
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/product/:productID",
      name: "Product",
      component: () => import("../views/ProductView.vue"),
      //meta: { requiresAuth: true },
      
    },
    {
      path: "/shop/:shopID",
      name: "Shop",
      component: () => import("../views/ShopView.vue"),
      //meta: { requiresAuth: true },
    },
    {
      path: "/category/:categoryID",
      name: "Category",
      component: () => import("../views/CategoryView.vue"),
      //meta: { requiresAuth: true },
    },
    {
      path: "/cart",
      name: "Cart",
      component: () => import("../views/CartView.vue"),
     // meta: { requiresAuth: true },
    },
    {
      path: "/checkout",
      name: "CheckOut",
      component: () => import("../views/CheckOutView.vue"),
      //meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("../views/UserProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: () => import("../views/admin/AdminView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: "",
          name: "AdminHome",
          component: () => import("../views/admin/AdminHome.vue"),
        },
        {
          path: "users",
          name: "AdminUsers",
          component: () => import("../views/admin/AdminUsers.vue"),
        },
        {
          path: "shops",
          name: "AdminShops",
          component: () => import("../views/admin/AdminShops.vue"),
        },
        {
          path: "products",
          name: "AdminProducts",
          component: () => import("../views/admin/AdminProducts.vue"),
        },
        {
          path: "categories",
          name: "AdminCategories",
          component: () => import("../views/admin/AdminCategories.vue"),
        },
        {
          path: "orders",
          name: "AdminOrders",
          component: () => import("../views/admin/AdminOrders.vue"),
        },
         {
          path: "reviews",
          name: "AdminReviews",
          component: () => import("../views/admin/AdminReviews.vue"),
        }
      ],
    },
  ],
});

// Authentication guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // Check if user is authenticated
  const isAuthenticated = userStore.token !== null;
  
  // Get user info if authenticated
  let user = null;
  let isAdmin = false;
  
  if (isAuthenticated) {
    try {
      user = userStore.getUser;
      isAdmin = user?.role === 'admin' || user?.isAdmin === true;
    } catch (error) {
      console.error('Error decoding token:', error);
      // If token is invalid, remove it and treat as not authenticated
      userStore.removeToken();
      return next('/login');
    }
  }
  
  // Handle authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  // Handle admin requirements
  else if (to.meta.requiresAdmin && !isAdmin) {
    next('/login');
  }
  // Redirect authenticated users away from login page
  else if (to.path === '/login' && isAuthenticated) {
    // Redirect admin users to admin panel, regular users to dashboard
    if (isAdmin) {
      next('/admin');
    } else {
      next('profile');
    }
  }
  // Redirect authenticated users away from register page
  /*else if (to.path === '/register' && isAuthenticated) {
    if (isAdmin) {
      next('/admin');
    } else {
      next('/dashboard');
    }
  }*/
  else {
    next();
  }
});

export default router;