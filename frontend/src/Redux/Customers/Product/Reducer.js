import { createSlice } from "@reduxjs/toolkit";
import {
  FIND_PRODUCTS_BY_CATEGORY_REQUEST,
  FIND_PRODUCTS_BY_CATEGORY_SUCCESS,
  FIND_PRODUCTS_BY_CATEGORY_FAILURE,
  FIND_PRODUCT_BY_ID_REQUEST,
  FIND_PRODUCT_BY_ID_SUCCESS,
  FIND_PRODUCT_BY_ID_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_FAILURE,
  DELETE_PRODUCT_SUCCESS,
  SEARCH_PRODUCTS_REQUEST,
  SEARCH_PRODUCTS_SUCCESS,
  SEARCH_PRODUCTS_FAILURE
} from "./ActionType";

const initialState = {
  products: {
    content: [],
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    pageSize: 10
  },
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  categories: [],
  selectedProduct: null,
  similarProducts: [],
  deleteProduct: null,
  searchResults: [],
  searchLoading: false,
  searchError: null
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    findProductsRequest: (state) => {
      console.log("Products fetch requested");
      state.loading = true;
      state.error = null;
    },
    findProductsSuccess: (state, action) => {
      console.log("Products received in reducer:", action.payload);
      state.loading = false;
      state.error = null;
      state.products = {
        content: action.payload.content || [],
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        totalElements: action.payload.totalElements || 0,
        pageSize: action.payload.pageSize || 10
      };
      state.lastFetched = Date.now();
      console.log("Updated state:", state);
    },
    findProductsFailure: (state, action) => {
      console.log("Products fetch failed:", action.payload);
      state.loading = false;
      state.error = action.payload;
      state.products = {
        content: [],
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        pageSize: 10
      };
    },
    findProductByIdRequest: (state) => {
      state.loading = true;
    },
    findProductByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
      state.error = null;
    },
    findProductByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    findSimilarProductsRequest: (state) => {
      state.loading = true;
    },
    findSimilarProductsSuccess: (state, action) => {
      state.loading = false;
      state.similarProducts = action.payload;
      state.error = null;
    },
    findSimilarProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    clearCache: (state) => {
      state.lastFetched = null;
    },
    createProductSuccess: (state, action) => {
      state.loading = false;
      state.products.content = [...state.products.content, action.payload];
    },
    createProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProductSuccess: (state, action) => {
      state.loading = false;
      state.products.content = state.products.content.map((product) =>
        product.id === action.payload.id ? action.payload : product
      );
    },
    updateProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProductSuccess: (state, action) => {
      state.loading = false;
      state.products.content = state.products.content.filter(
        (product) => product.id !== action.payload
      );
    },
    deleteProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    searchProductsRequest: (state) => {
      state.searchLoading = true;
      state.searchError = null;
      state.searchResults = [];
    },
    searchProductsSuccess: (state, action) => {
      state.searchLoading = false;
      state.searchResults = action.payload;
    },
    searchProductsFailure: (state, action) => {
      state.searchLoading = false;
      state.searchError = action.payload;
      state.searchResults = [];
    },
  },
});

export const {
  findProductsRequest,
  findProductsSuccess,
  findProductsFailure,
  findProductByIdRequest,
  findProductByIdSuccess,
  findProductByIdFailure,
  findSimilarProductsRequest,
  findSimilarProductsSuccess,
  findSimilarProductsFailure,
  searchProductsRequest,
  searchProductsSuccess,
  searchProductsFailure,
  clearCache,
  setCategories,
  createProductSuccess,
  createProductFailure,
  updateProductSuccess,
  updateProductFailure,
  deleteProductSuccess,
  deleteProductFailure,
} = productSlice.actions;

export default productSlice.reducer;
