import axios from "axios";

import {
  FIND_PRODUCTS_BY_CATEGORY_REQUEST,
  FIND_PRODUCTS_BY_CATEGORY_SUCCESS,
  FIND_PRODUCTS_BY_CATEGORY_FAILURE,
  FIND_PRODUCT_BY_ID_REQUEST,
  FIND_PRODUCT_BY_ID_SUCCESS,
  FIND_PRODUCT_BY_ID_FAILURE,
  CREATE_PRODUCT_REQUEST,   // Add these
  CREATE_PRODUCT_SUCCESS,   // three
  CREATE_PRODUCT_FAILURE,   // lines
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  SEARCH_PRODUCTS_REQUEST,
  SEARCH_PRODUCTS_SUCCESS,
  SEARCH_PRODUCTS_FAILURE,
} from "./ActionType";
import api from "../../../config/api";
import {
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
} from "./Reducer";

export const findProducts = (params) => async (dispatch, getState) => {
  const state = getState();
  const productState = state?.customersProduct || {};
  const now = Date.now();
  const isCacheValid = productState.lastFetched && (now - productState.lastFetched < productState.cacheExpiry);

  console.log("findProducts called with params:", params);
  console.log("Cache status:", { isCacheValid, lastFetched: productState.lastFetched, now });

  // If we have valid cached data and no specific params, return cached data
  if (isCacheValid && !params) {
    console.log("Using cached data");
    return;
  }

  dispatch(findProductsRequest());
  try {
    console.log("Making API call to fetch products");
    
    // Convert availability filter to stock parameter
    const apiParams = {
      ...params,
      stock: params.availability === "in_stock" ? true : 
             params.availability === "out_of_stock" ? false : undefined
    };
    
    const response = await api.get("/api/products", { params: apiParams });
    console.log("API response:", response.data);
    
    // Ensure the response has the correct structure
    const productsData = {
      content: response.data.content || [],
      currentPage: response.data.currentPage || 1,
      totalPages: response.data.totalPages || 1,
      totalElements: response.data.totalElements || 0,
      pageSize: response.data.pageSize || 10
    };
    
    console.log("Dispatching products data:", productsData);
    dispatch(findProductsSuccess(productsData));
  } catch (error) {
    console.error("API error:", error);
    dispatch(findProductsFailure(error.message));
  }
};

export const findProductById = (productId) => async (dispatch) => {
  console.log("Finding product by ID:", productId);
  dispatch(findProductByIdRequest());
  
  try {
    const response = await api.get(`/api/products/${productId}`);
    console.log("Product found:", response.data);
    dispatch(findProductByIdSuccess(response.data));
  } catch (error) {
    console.error("Error finding product:", error);
    dispatch(findProductByIdFailure(error.response?.data?.message || "Failed to find product"));
  }
};

export const findSimilarProducts = (productId) => async (dispatch) => {
  dispatch(findSimilarProductsRequest());
  try {
    const response = await api.get(`/api/products/${productId}/similar`);
    dispatch(findSimilarProductsSuccess(response.data));
  } catch (error) {
    dispatch(findSimilarProductsFailure(error.message));
  }
};

export const searchProducts = (query) => async (dispatch) => {
  dispatch(searchProductsRequest());
  try {
    const response = await api.get("/api/products/search", {
      params: { query }
    });
    dispatch(searchProductsSuccess(response.data));
  } catch (error) {
    dispatch(searchProductsFailure(error.message));
  }
};

// Helper function to clear cache when needed (e.g., after product updates)
export const clearProductCache = () => (dispatch) => {
  dispatch(clearCache());
};

export const createProduct = (product) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const { data } = await api.post(
      `/api/admin/products/`,
      product.data
    );

    dispatch({
      type: CREATE_PRODUCT_SUCCESS,
      payload: data,
    });

    console.log("created product ", data);
  } catch (error) {
    console.error("Error creating product:", error);
    dispatch({
      type: CREATE_PRODUCT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateProduct = (product) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const { data } = await api.put(
      `/api/admin/products/${product.id}`,
      product.data
    );
    console.log("update product ", data);
    dispatch({
      type: UPDATE_PRODUCT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    dispatch({
      type: UPDATE_PRODUCT_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteProduct = (productId) => async (dispatch) => {
  console.log("delete product action", productId);
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    let { data } = await api.delete(`/api/admin/products/${productId}`);

    console.log("delete product ", data);

    dispatch({
      type: DELETE_PRODUCT_SUCCESS,
      payload: productId,
    });

    console.log("product delete ", data);
  } catch (error) {
    console.error("Error deleting product:", error);
    dispatch({
      type: DELETE_PRODUCT_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};