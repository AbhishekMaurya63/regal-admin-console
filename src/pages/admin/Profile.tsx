import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Key, Shield, Monitor } from "lucide-react";
import { getDataHandlerWithToken, putDataHandlerWithToken } from "@/config/services";
import ApiConfig from '@/config/apiConfig';
interface ProfileData {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string;
  address?: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: "",
    name: "",
    email: "",
    username: "",
    role: "",
    createdAt: "",
    updatedAt: "",
    __v: 0,
    phone: "",
    address: ""
  });
  const [editData, setEditData] = useState<ProfileData>({ ...profileData });
  const { toast } = useToast();

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await getDataHandlerWithToken("Profile");
      if (response) {
        setProfileData(response);
        setEditData(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch profile data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Prepare data for update (only name, email, and username can be updated)
      const updateData = {
        name: editData.name,
        email: editData.email,
        username: editData.username
      };
      const endpoint = ApiConfig.updateUsers(profileData._id)
      const response = await putDataHandlerWithToken(endpoint, updateData, null, true);
      
      if (response.message) {
        setProfileData(response.user);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // In a real app, this would handle file upload
    toast({
      title: "Avatar Upload",
      description: "Avatar upload feature would be implemented here.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
              <p className="text-gray-600">
                Update your profile picture
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-800">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
              {/* {isEditing && (
                <button 
                  onClick={handleAvatarUpload}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </button>
              )} */}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <p className="text-gray-600">
                Your basic account details
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        id="name"
                        type="text"
                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <span className="flex-1 text-gray-900">{profileData.name}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        id="email"
                        type="email"
                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    ) : (
                      <span className="flex-1 text-gray-900">{profileData.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        id="username"
                        type="text"
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      />
                    ) : (
                      <span className="flex-1 text-gray-900">{profileData.username}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-gray-900 capitalize">{profileData.role}</span>
                  </div>
                </div>
              </div>

              {/* <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        id="phone"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.phone || ""}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        disabled
                      />
                    ) : (
                      <span className="flex-1 text-gray-900">{profileData.phone || "Not provided"}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Join Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-gray-900">{new Date(profileData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {isEditing ? (
                    <input
                      id="address"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData.address || ""}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      disabled
                    />
                  ) : (
                    <span className="flex-1 text-gray-900">{profileData.address || "Not provided"}</span>
                  )}
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Account Statistics</h2>
            <p className="text-gray-600">
              Overview of your admin activities
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-gray-600">Users Managed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2,340</div>
              <div className="text-sm text-gray-600">Products Added</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">45</div>
              <div className="text-sm text-gray-600">Categories Created</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">567</div>
              <div className="text-sm text-gray-600">Queries Resolved</div>
            </div>
          </div>
        </div> */}

        {/* Security Settings */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            <p className="text-gray-600">
              Manage your password and security preferences
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-600">Last changed 30 days ago</p>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center">
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Session Management</h4>
                <p className="text-sm text-gray-600">Manage active sessions</p>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center">
                <Monitor className="mr-2 h-4 w-4" />
                View Sessions
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;