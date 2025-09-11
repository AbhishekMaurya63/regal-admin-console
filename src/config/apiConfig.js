const url = "https://anantattire-dvk2.onrender.com";
// const url = "http://localhost:5000"
const ApiConfig = {
  url,
  products: `${url}/api/products`,
  getproductById: (id)=> `${url}/api/products/${id}`,
  category: `${url}/api/categories`,
  uploadImage: `${url}/api/upload`,
  deleteImage:`${url}/api/delete`,

  // Authentications
  passwordLogin:`${url}/api/auth/login`,
  forgetPassword:`${url}/api/auth/forgot-password`,
  varifyOTP:`${url}/api/auth/validate-otp`,
  resetPassword:`${url}/api/auth/reset-password`,
  logout:`${url}/api/auth/logout`,

// user management
  registerUser: `${url}/api/auth/register`,
  getUsers: `${url}/api/users`,
  updateUsers:(id)=>`${url}/api/users/${id}`,


  // category management
  category: `${url}/api/categories`,
  changeCategory:(id)=> `${url}/api/categories/${id}`,

  // product Management
  product: `${url}/api/products`,
  changeProduct:(id)=>`${url}/api/products/${id}`,

  // profile
  Profile:`${url}/api/users/profile`,

  // Query
  query: `${url}/api/queries`,
  queryById:(id)=> `${url}/api/queries/${id}`,
  updateQuery:(id)=>`${url}/api/queries/${id}/status`,
}
export default ApiConfig;