import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import userService from '../services/userService';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ProfileEdit = () => {
  const { authState, checkAuth } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    if (authState.user) {
      setProfileData({
        firstName: authState.user.firstName || '',
        lastName: authState.user.lastName || '',
        email: authState.user.email || '',
        mobile: authState.user.mobile || '',
        role: authState.user.role || ''
      });
      
      if (authState.user.profilePicture) {
        setProfilePicturePreview(`http://localhost:5000${authState.user.profilePicture}`);
      }
    }
  }, [authState.user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== '' && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      await userService.updateProfile(formData);
      await checkAuth(); // Refresh user data
      
      setIsEditing(false);
      setProfilePicture(null);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicture(null);
    // Reset form data to original values
    if (authState.user) {
      setProfileData({
        firstName: authState.user.firstName || '',
        lastName: authState.user.lastName || '',
        email: authState.user.email || '',
        mobile: authState.user.mobile || '',
        role: authState.user.role || ''
      });
      
      if (authState.user.profilePicture) {
        setProfilePicturePreview(`http://localhost:5000${authState.user.profilePicture}`);
      }
    }
  };

  if (!authState.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <label
                  htmlFor="profilePictureInput"
                  className="absolute bottom-2 right-2 bg-emerald-500 rounded-full p-2 cursor-pointer hover:bg-emerald-600 transition-colors duration-200 shadow-lg"
                >
                  <CameraIcon className="w-4 h-4 text-white" />
                </label>
              )}
            </div>
            
            <input
              id="profilePictureInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="text-gray-600 capitalize">{profileData.role}</p>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
