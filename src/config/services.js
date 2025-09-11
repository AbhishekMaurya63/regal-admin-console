import axios from "axios";
import ApiConfig from "./apiConfig";
import { toast } from "react-toastify";

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  }
});
const getAuthHeadersFormData = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  }
});

// Common response handler
const handleResponse = (res, successMessage) => {
  // Check for both 200 and 201 status codes
  if (res?.status === 200 || res?.status === 201) {
    return res.data;
  } else {
    // Modified to match likely API error structure
    const errorMsg = res?.data?.message || 
                    res?.data?.error ||
                    "Request failed";
    throw res?.data || res; // Throw instead of return to maintain error flow
  }
};

// Common error handler
const handleError = (error) => {
  console.error("API Error:", error);
  const errorMsg = error.response?.data?.message || 
                  error.response?.data?.error || 
                  error.message || 
                  "Request failed";
  throw error.response?.data || error.response || error; // Throw to maintain error flow
};

// Base request handler
const makeRequest = async (method, endPointOrUrl, config) => {
  // const isUrl = config?.isUrl || false; // Check if it's a direct URL
  try {
    const finalUrl = config.isUrl
      ? endPointOrUrl // direct URL like https://.../course/123
      : ApiConfig[endPointOrUrl]; // use from config if key
    const response = await axios({
      method,
      url: finalUrl,
      ...config
    });

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const postDataHandler = async (endPoint, data) => {
  console.log(endPoint,data)
  return makeRequest("POST", endPoint, { data });
};

export const postDataHandlerWithToken = async (endPoint, data,isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("POST", endPoint, { 
    data, 
    isUrl,
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};
export const postDataHandlerWithTokenFormData = async (endPoint, data,isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("POST", endPoint, { 
    data, 
    isUrl,
    ...getAuthHeadersFormData(initialAuth?.authToken) 
  });
};


export const putDataHandler = async (endPoint, data) => {
  return makeRequest("PUT", endPoint, { data });
};

export const putDataHandlerWithToken = async (endPoint, data, params, isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("PUT", endPoint, { 
    data, 
    params, 
    isUrl,
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};
export const putDataHandlerWithTokenFormData = async (endPoint, data, params, isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("PUT", endPoint, { 
    data, 
    params, 
    isUrl,
    ...getAuthHeadersFormData(initialAuth?.authToken) 
  });
};
export const deleteDataHandler = async (endPoint, isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("DELETE", endPoint, { 
    isUrl:isUrl, 
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};

export const deleteDataHandlerImage = async (endPoint,data, isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("DELETE", endPoint, { 
    data,
    isUrl:isUrl, 
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};
export const patchDataHandler = async (endPoint, data) => {
  return makeRequest("PATCH", endPoint, { data });
};

export const patchTokenDataHandler = async (endPoint, data ,isUrl=false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("PATCH", endPoint, { 
    data, 
    isUrl,
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};
export const putTokenDataHandler = async (endPoint, data) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("PUT", endPoint, { 
    data, 
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};

export const patchTokenDataHandlerFormData = async (endPoint, data) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("PATCH", endPoint, { 
    data, 
    ...getAuthHeadersFormData(initialAuth?.authToken) 
  });
};


export const deleteDataHandlerWithoutToken = async (endPoint, query) => {
  return makeRequest("DELETE", endPoint, { params: query });
};

export const getDataHandler = async (endPointOrUrl, query = {}, data = {}, isUrl = false) => {
  return makeRequest("GET", endPointOrUrl, {
    params: query,
    data,
    isUrl
  });
};

export const getDataHandlerWithToken = async (endPoint, query, data, isUrl = false) => {
  const storedAuth = sessionStorage.getItem('auth');
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;
  if (!initialAuth?.authToken) {
    throw new Error('No authentication token found');
  }
  return makeRequest("GET", endPoint, { 
    params: query, 
    data, 
    isUrl,
    ...getAuthHeaders(initialAuth?.authToken) 
  });
};