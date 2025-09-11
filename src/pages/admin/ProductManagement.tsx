import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Eye, Package, Upload, X } from "lucide-react";
import { getDataHandlerWithToken, postDataHandlerWithToken,deleteDataHandlerImage,postDataHandlerWithTokenFormData, putDataHandlerWithToken, deleteDataHandler } from "@/config/services";
import ApiConfig from '@/config/apiConfig';

interface Image {
  public_id: string;
  url: string;
  _id?: string;
}

interface Size {
  size: string;
  _id?: string;
}

interface Color {
  name: string;
  _id?: string;
}

interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  thumbnail: Image;
  images: Image[];
  originalPrice: number;
  discountedPrice: number;
  ratings: number;
  inStock: boolean;
  label: string;
  featured: boolean;
  details: {
    materials: string;
    careInstructions: string[];
    features: string[];
  };
  sizes: Size[];
  colors: Color[];
  category: string | Category;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  inStock: boolean;
  label: string;
  featured: boolean;
  details: {
    materials: string;
    careInstructions: string[];
    features: string[];
  };
  sizes: Size[];
  colors: Color[];
  category: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    inStock: true,
    label: "",
    featured: false,
    details: {
      materials: "",
      careInstructions: [],
      features: []
    },
    sizes: [],
    colors: [],
    category: ""
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Refs for tag inputs
  const careInstructionsRef = useRef<HTMLInputElement>(null);
  const featuresRef = useRef<HTMLInputElement>(null);
  const sizesRef = useRef<HTMLInputElement>(null);
  const colorsRef = useRef<HTMLInputElement>(null);

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getDataHandlerWithToken("product");
      if (response) {
        setProducts(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getDataHandlerWithToken('category');
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const uploadImage = async (file: File): Promise<{public_id: string; url: string} | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await postDataHandlerWithTokenFormData('uploadImage', formData);
      if (response) {
        return {
          public_id: response.public_id,
          url: response.url
        };
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload image.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading the image.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteImage = async (public_id: string) => {
    try {
      const response = await deleteDataHandlerImage('deleteImage', { public_id });
      
      if (!response.success) {
        console.error("Failed to delete image:", public_id);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleAddProduct = async () => {
    console.log(newProduct)
    if (!newProduct.name || !newProduct.description || !newProduct.category || !newProduct.originalPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!thumbnailFile) {
      toast({
        title: "Missing Thumbnail",
        description: "Please upload a thumbnail image.",
      });
      return;
    }

    try {
      setIsLoading(true);
      

      const thumbnail = await uploadImage(thumbnailFile);
      if (!thumbnail) return;

      // Upload other images
      const uploadedImages: Image[] = [];
      for (const file of imageFiles) {
        const image = await uploadImage(file);
        if (image) {
          uploadedImages.push(image);
        }
      }

      // Prepare product data
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        thumbnail,
        images: uploadedImages,
        originalPrice: Number(newProduct.originalPrice),
        discountedPrice: Number(newProduct.discountedPrice) || Number(newProduct.originalPrice),
        ratings: 0,
        inStock: newProduct.inStock,
        label: newProduct.label,
        featured: newProduct.featured,
        details: newProduct.details,
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        category: newProduct.category
      };

      // Create product
      const response = await postDataHandlerWithToken('product', productData);
      
      if (response) {
        setProducts([...products, response]);
        resetForm();
        setIsAddDialogOpen(false);
        toast({
          title: "Product Added",
          description: "New product has been successfully added.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.description || !editingProduct.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // If new thumbnail is uploaded
      let thumbnail = editingProduct.thumbnail;
      if (thumbnailFile) {
        // Delete old thumbnail if exists
        if (editingProduct.thumbnail?.public_id) {
          await deleteImage(editingProduct.thumbnail.public_id);
        }
        
        // Upload new thumbnail
        const newThumbnail = await uploadImage(thumbnailFile);
        if (newThumbnail) {
          thumbnail = newThumbnail;
        }
      }

      // Handle image updates
      const currentImages = editingProduct.images || [];
      const newUploadedImages: Image[] = [];
      
      // Upload new images
      for (const file of imageFiles) {
        const image = await uploadImage(file);
        if (image) {
          newUploadedImages.push(image);
        }
      }
      
      // Combine existing and new images
      const updatedImages = [...currentImages, ...newUploadedImages];

      // Prepare product data
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        thumbnail,
        images: updatedImages,
        originalPrice: Number(editingProduct.originalPrice),
        discountedPrice: Number(editingProduct.discountedPrice),
        inStock: editingProduct.inStock,
        label: editingProduct.label,
        featured: editingProduct.featured,
        details: editingProduct.details,
        sizes: editingProduct.sizes,
        colors: editingProduct.colors,
        category: editingProduct.category
      };

      // Update product
      const endpoint = ApiConfig.changeProduct(editingProduct._id)
      const response = await putDataHandlerWithToken(endpoint,productData,null,true);
      
      if (response) {
        setProducts(products.map(product => 
          product._id === editingProduct._id ? response : product
        ));
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      // First get product to delete its images
      const productToDelete = products.find(p => p._id === id);
      console.log(productToDelete)
      if (productToDelete) {
        // Delete thumbnail
        if (productToDelete.thumbnail?.public_id) {
          await deleteImage(productToDelete.thumbnail.public_id);
        }
        
        // Delete all images
        for (const image of productToDelete.images) {
          if (image.public_id) {
            await deleteImage(image.public_id);
          }
        }
      }
      
      // Delete product
      const endpoint = ApiConfig.changeProduct(id)
      const response = await deleteDataHandler(endpoint,true);
      
      if (response) {
        setProducts(products.filter(product => product._id !== id));
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async (index: number, isEditMode: boolean = false) => {
    if (isEditMode && editingProduct) {
      const imageToRemove = editingProduct.images[index];
      
      // Delete from cloud
      if (imageToRemove.public_id) {
        await deleteImage(imageToRemove.public_id);
      }
      
      // Update state
      const updatedImages = [...editingProduct.images];
      updatedImages.splice(index, 1);
      setEditingProduct({...editingProduct, images: updatedImages});
    } else {
      // Remove from new product images
      const updatedPreviews = [...imagePreviews];
      const updatedFiles = [...imageFiles];
      updatedPreviews.splice(index, 1);
      updatedFiles.splice(index, 1);
      setImagePreviews(updatedPreviews);
      setImageFiles(updatedFiles);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      inStock: true,
      label: "",
      featured: false,
      details: {
        materials: "",
        careInstructions: [],
        features: []
      },
      sizes: [],
      colors: [],
      category: ""
    });
    setThumbnailFile(null);
    setImageFiles([]);
    setThumbnailPreview(null);
    setImagePreviews([]);
  };

  // Function to handle adding tags on Enter key press
  const handleTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'careInstructions' | 'features' | 'sizes' | 'colors',
    isEdit: boolean = false
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      
      if (value) {
        if (isEdit && editingProduct) {
          // For edit mode
          if (field === 'careInstructions' || field === 'features') {
            setEditingProduct({
              ...editingProduct,
              details: {
                ...editingProduct.details,
                [field]: [...editingProduct.details[field], value]
              }
            });
          } else {
            setEditingProduct({
              ...editingProduct,
              [field]: [...editingProduct[field], { [field === 'colors' ? 'name' : 'size']: value }]
            });
          }
        } else {
          // For add mode
          if (field === 'careInstructions' || field === 'features') {
            setNewProduct({
              ...newProduct,
              details: {
                ...newProduct.details,
                [field]: [...newProduct.details[field], value]
              }
            });
          } else {
            setNewProduct({
              ...newProduct,
              [field]: [...newProduct[field], { [field === 'colors' ? 'name' : 'size']: value }]
            });
          }
        }
        input.value = '';
      }
    }
  };

  // Function to remove tags
  const removeTag = (
    index: number,
    field: 'careInstructions' | 'features' | 'sizes' | 'colors',
    isEdit: boolean = false
  ) => {
    if (isEdit && editingProduct) {
      if (field === 'careInstructions' || field === 'features') {
        const updated = [...editingProduct.details[field]];
        updated.splice(index, 1);
        setEditingProduct({
          ...editingProduct,
          details: {
            ...editingProduct.details,
            [field]: updated
          }
        });
      } else {
        const updated = [...editingProduct[field]];
        updated.splice(index, 1);
        setEditingProduct({
          ...editingProduct,
          [field]: updated
        });
      }
    } else {
      if (field === 'careInstructions' || field === 'features') {
        const updated = [...newProduct.details[field]];
        updated.splice(index, 1);
        setNewProduct({
          ...newProduct,
          details: {
            ...newProduct.details,
            [field]: updated
          }
        });
      } else {
        const updated = [...newProduct[field]];
        updated.splice(index, 1);
        setNewProduct({
          ...newProduct,
          [field]: updated
        });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof product.category === 'object' ? product.category.name : product.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (inStock: boolean) => {
    if (inStock) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">In Stock</span>;
    }
    return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Out of Stock</span>;
  };

  const renderProductForm = (isEdit: boolean = false) => {
    const product = isEdit ? editingProduct : newProduct;
    
    if (!product && isEdit) return null;

    const careInstructions = isEdit 
      ? editingProduct?.details.careInstructions || [] 
      : newProduct.details.careInstructions;
    
    const features = isEdit 
      ? editingProduct?.details.features || [] 
      : newProduct.details.features;
    
    const sizes = isEdit 
      ? editingProduct?.sizes || [] 
      : newProduct.sizes;
    
    const colors = isEdit 
      ? editingProduct?.colors || [] 
      : newProduct.colors;

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
            <input
              id="name"
              type="text"
              className="w-full text-black px-3  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isEdit ? editingProduct?.name : newProduct.name}
              onChange={(e) => isEdit 
                ? setEditingProduct({...editingProduct!, name: e.target.value})
                : setNewProduct({...newProduct, name: e.target.value})
              }
              placeholder="Enter product name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
            <select 
              id="category"
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isEdit 
                ? typeof editingProduct?.category === 'object' 
                  ? editingProduct.category._id 
                  : editingProduct?.category
                : newProduct.category
              }
              onChange={(e) => isEdit 
                ? setEditingProduct({...editingProduct!, category: e.target.value})
                : setNewProduct({...newProduct, category: e.target.value})
              }
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            id="description"
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={isEdit ? editingProduct?.description : newProduct.description}
            onChange={(e) => isEdit 
              ? setEditingProduct({...editingProduct!, description: e.target.value})
              : setNewProduct({...newProduct, description: e.target.value})
            }
            placeholder="Enter product description"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price (₹) *</label>
            <input
              id="originalPrice"
              type="number"
              className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isEdit ? editingProduct?.originalPrice : newProduct.originalPrice}
              onChange={(e) => isEdit 
                ? setEditingProduct({...editingProduct!, originalPrice: Number(e.target.value)})
                : setNewProduct({...newProduct, originalPrice: e.target.value})
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700">Discounted Price (₹)</label>
            <input
              id="discountedPrice"
              type="number"
              className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isEdit ? editingProduct?.discountedPrice : newProduct.discountedPrice}
              onChange={(e) => isEdit 
                ? setEditingProduct({...editingProduct!, discountedPrice: Number(e.target.value)})
                : setNewProduct({...newProduct, discountedPrice: e.target.value})
              }
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="label" className="block text-sm font-medium text-gray-700">Label</label>
            <input
              id="label"
              type="text"
              className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isEdit ? editingProduct?.label : newProduct.label}
              onChange={(e) => isEdit 
                ? setEditingProduct({...editingProduct!, label: e.target.value})
                : setNewProduct({...newProduct, label: e.target.value})
              }
              placeholder="e.g., Sale, New"
            />
          </div>
          <div className="space-y-2 flex items-end">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                className="h-4 text-black w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isEdit ? editingProduct?.featured : newProduct.featured}
                onChange={(e) => isEdit 
                  ? setEditingProduct({...editingProduct!, featured: e.target.checked})
                  : setNewProduct({...newProduct, featured: e.target.checked})
                }
              />
              <label htmlFor="featured" className="block text-sm font-medium text-gray-700 cursor-pointer">Featured Product</label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="materials" className="block text-sm font-medium text-gray-700">Materials</label>
          <input
            id="materials"
            type="text"
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={isEdit ? editingProduct?.details.materials : newProduct.details.materials}
            onChange={(e) => isEdit 
              ? setEditingProduct({
                  ...editingProduct!, 
                  details: {...editingProduct.details, materials: e.target.value}
                })
              : setNewProduct({
                  ...newProduct, 
                  details: {...newProduct.details, materials: e.target.value}
                })
            }
            placeholder="e.g., 100% Cotton"
          />
        </div>
        
        {/* Care Instructions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Care Instructions</label>
          <input
            ref={careInstructionsRef}
            type="text"
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type instruction and press Enter"
            onKeyDown={(e) => handleTagInput(e, 'careInstructions', isEdit)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {careInstructions.map((instruction, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                {instruction}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => removeTag(index, 'careInstructions', isEdit)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Features</label>
          <input
            ref={featuresRef}
            type="text"
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type feature and press Enter"
            onKeyDown={(e) => handleTagInput(e, 'features', isEdit)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {features.map((feature, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                {feature}
                <button
                  type="button"
                  className="ml-1 text-purple-600 hover:text-purple-800"
                  onClick={() => removeTag(index, 'features', isEdit)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Sizes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sizes</label>
          <input
            ref={sizesRef}
            type="text"
            className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type size and press Enter"
            onKeyDown={(e) => handleTagInput(e, 'sizes', isEdit)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.map((size, index) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                {size.size}
                <button
                  type="button"
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                  onClick={() => removeTag(index, 'sizes', isEdit)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Colors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Colors</label>
          <input
            ref={colorsRef}
            type="text"
            className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type color and press Enter"
            onKeyDown={(e) => handleTagInput(e, 'colors', isEdit)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((color, index) => (
              <span key={index} className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                {color.name}
                <button
                  type="button"
                  className="ml-1 text-pink-600 hover:text-pink-800"
                  onClick={() => removeTag(index, 'colors', isEdit)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        
       <div className="space-y-4">
  <label className="block text-sm font-medium text-gray-700">Images</label>
  
  <div className="space-y-2">
    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail *</label>
    <div className="flex items-center space-x-2">
      <input
        id="thumbnail"
        type="file"
        onChange={handleThumbnailChange}
        accept="image/*"
        className="hidden"
      />
      <label 
        htmlFor="thumbnail" 
        className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Thumbnail
      </label>
      {(thumbnailPreview || (isEdit && editingProduct?.thumbnail)) && (
        <div className="relative">
          <img 
            src={thumbnailPreview || (isEdit && editingProduct?.thumbnail.url)} 
            alt="Thumbnail preview" 
            className="h-12 w-12 object-cover rounded"
          />
        </div>
      )}
    </div>
  </div>
  
  <div className="space-y-2">
    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Additional Images</label>
    <div className="flex items-center space-x-2">
      <input
        id="images"
        type="file"
        multiple
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <label 
        htmlFor="images" 
        className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Images
      </label>
    </div>
    
    <div className="flex flex-wrap gap-2 mt-2">
      {/* Existing images in edit mode */}
      {isEdit && editingProduct?.images.map((image, index) => (
        <div key={index} className="relative">
          <img 
            src={image.url} 
            alt={`Product image ${index + 1}`} 
            className="h-16 w-16 object-cover rounded"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
            onClick={() => handleRemoveImage(index, true)}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      {/* Newly uploaded images */}
      {imagePreviews.map((preview, index) => (
        <div key={index} className="relative">
          <img 
            src={preview} 
            alt={`New image ${index + 1}`} 
            className="h-16 w-16 object-cover rounded"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
            onClick={() => handleRemoveImage(index)}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  </div>
</div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="inStock"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isEdit ? editingProduct?.inStock : newProduct.inStock}
            onChange={(e) => isEdit 
              ? setEditingProduct({...editingProduct!, inStock: e.target.checked})
              : setNewProduct({...newProduct, inStock: e.target.checked})
            }
          />
          <label htmlFor="inStock" className="block text-sm font-medium text-gray-700 cursor-pointer">In Stock</label>
        </div>
        
        <button 
          onClick={isEdit ? handleEditProduct : handleAddProduct} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : (isEdit ? "Update Product" : "Add Product")}
        </button>
      </div>
    );
  };

  const renderProductViewModal = () => {
    if (!viewingProduct) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h2>
            <button 
              onClick={() => setIsViewDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thumbnail</h3>
                  <img 
                    src={viewingProduct.thumbnail.url} 
                    alt={viewingProduct.name}
                    className="w-full h-64 object-contain rounded-lg border"
                  />
                </div>
                
                {viewingProduct.images && viewingProduct.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {viewingProduct.images.map((image, index) => (
                        <img 
                          key={index}
                          src={image.url} 
                          alt={`${viewingProduct.name} ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{viewingProduct.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
                    <p className="text-gray-700">
                      <span className="font-medium">Original Price:</span> ₹{viewingProduct.originalPrice}
                    </p>
                    {viewingProduct.discountedPrice > 0 && (
                      <p className="text-gray-700">
                        <span className="font-medium">Discounted Price:</span> ₹{viewingProduct.discountedPrice}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                    <p className="text-gray-700">
                      <span className="font-medium">Stock:</span> {viewingProduct.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Featured:</span> {viewingProduct.featured ? 'Yes' : 'No'}
                    </p>
                    {viewingProduct.label && (
                      <p className="text-gray-700">
                        <span className="font-medium">Label:</span> {viewingProduct.label}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                  <p className="text-gray-700">
                    {typeof viewingProduct.category === 'object' ? viewingProduct.category.name : viewingProduct.category}
                  </p>
                </div>
                
                {viewingProduct.details.materials && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials</h3>
                    <p className="text-gray-700">{viewingProduct.details.materials}</p>
                  </div>
                )}
                
                {viewingProduct.details.features && viewingProduct.details.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {viewingProduct.details.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {viewingProduct.details.careInstructions && viewingProduct.details.careInstructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Care Instructions</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {viewingProduct.details.careInstructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {viewingProduct.sizes && viewingProduct.sizes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.sizes.map((size, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {size.size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingProduct.colors && viewingProduct.colors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.colors.map((color, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {color.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Created Date</h3>
                  <p className="text-gray-700">
                    {new Date(viewingProduct.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">
              Manage your product inventory and details
            </p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </button>
        </div>

        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
                <button onClick={() => setIsAddDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Create a new product listing</p>
                {renderProductForm(false)}
              </div>
            </div>
          </div>
        )}

        {isEditDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                <button onClick={() => setIsEditDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Update product information</p>
                {renderProductForm(true)}
              </div>
            </div>
          </div>
        )}

        {isViewDialogOpen && renderProductViewModal()}

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            </div>
            <p className="text-gray-600 mb-4">
              A list of all products in your inventory
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={product.thumbnail.url} 
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {typeof product.category === 'object' ? product.category.name : product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹{product.originalPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-black">
                          {product.discountedPrice ? `₹${product.discountedPrice}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.inStock)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.createdAt!).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setViewingProduct(product);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-800"
                              onClick={() => {
                                setEditingProduct(product);
                                setThumbnailFile(null);
                                setImageFiles([]);
                                setThumbnailPreview(null);
                                setImagePreviews([]);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteProduct(product._id!)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;