import api from '../../../config/api';

export const GET_RECENT_PRODUCTS_REQUEST = 'GET_RECENT_PRODUCTS_REQUEST';
export const GET_RECENT_PRODUCTS_SUCCESS = 'GET_RECENT_PRODUCTS_SUCCESS';
export const GET_RECENT_PRODUCTS_FAILURE = 'GET_RECENT_PRODUCTS_FAILURE';

export const getRecentProducts = () => async (dispatch) => {
  dispatch({ type: GET_RECENT_PRODUCTS_REQUEST });
  
  try {
    const jwt = localStorage.getItem('jwt');
    const response = await api.get('/api/products', {
      params: {
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    // Log the response to debug
    console.log('Products API Response:', response.data);
    
    // Ensure we have an array of products and handle the response structure
    const products = Array.isArray(response.data.content) 
      ? response.data.content.map(product => ({
          ...product,
          category: product.category ? {
            id: product.category.id,
            name: product.category.name
          } : null
        }))
      : [];
    
    dispatch({
      type: GET_RECENT_PRODUCTS_SUCCESS,
      payload: products,
    });
  } catch (error) {
    console.error('Error fetching recent products:', error);
    dispatch({
      type: GET_RECENT_PRODUCTS_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch recent products',
    });
  }
}; 