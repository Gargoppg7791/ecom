import api from "../../../config/api";
import { setCategories, setLoading, setError } from "./Reducer";

export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get('/api/categories');
    const topLevelCategories = response.data.filter(cat => cat.level === 1);
    dispatch(setCategories(topLevelCategories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    dispatch(setError(error.message));
  }
}; 