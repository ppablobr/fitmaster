import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Calendar, 
  Users, 
  Ruler, 
  Weight as WeightIcon,
  Mail 
} from 'lucide-react';
import { Toast } from '../components/Toast';

export function Account() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(profileData);
          setUpdatedProfile(profileData || {});
          setUpdatedEmail(user.email);
        }
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setShowLogoutConfirmation(false);
  };

  const handleOpenLogoutConfirmation = () => {
    setShowLogoutConfirmation(true);
  };

  const handleCloseLogoutConfirmation = () => {
    setShowLogoutConfirmation(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedProfile(profile);
    setUpdatedEmail(user.email);
  };

  const handleSaveProfile = async () => {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updatedProfile,
      }, { returning: 'minimal' });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      setToast({
        message: 'Failed to update profile.',
        type: 'error',
      });
      return;
    }

    setProfile(updatedProfile);
    setIsEditing(false);
    setToast({
      message: 'Profile updated successfully!',
      type: 'success',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Information</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Details</h2>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Name</strong>
                </div>
                <input
                  type="text"
                  name="name"
                  value={updatedProfile?.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Age</strong>
                </div>
                <input
                  type="number"
                  name="age"
                  value={updatedProfile?.age || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Gender</strong>
                </div>
                <select
                  name="gender"
                  value={updatedProfile?.gender || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Height (cm)</strong>
                </div>
                <input
                  type="number"
                  name="height"
                  value={updatedProfile?.height || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <WeightIcon className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Weight (kg)</strong>
                </div>
                <input
                  type="number"
                  name="weight"
                  value={updatedProfile?.weight || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Email</strong>
                </div>
                <span className="mt-1 text-gray-900">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Name</strong>
                </div>
                <span className="mt-1 text-gray-900">{profile?.name || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Age</strong>
                </div>
                <span className="mt-1 text-gray-900">{profile?.age || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Gender</strong>
                </div>
                <span className="mt-1 text-gray-900">{profile?.gender || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Height (cm)</strong>
                </div>
                <span className="mt-1 text-gray-900">{profile?.height || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <WeightIcon className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Weight (kg)</strong>
                </div>
                <span className="mt-1 text-gray-900">{profile?.weight || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <strong className="font-medium text-gray-700">Email</strong>
                </div>
                <span className="mt-1 text-gray-900">{user.email}</span>
              </div>
            </div>
          )}
          <div className="mt-4">
            {isEditing ? (
              <div>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-md bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded-md bg-gray-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
          <p className="text-gray-600">No settings available yet.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={handleOpenLogoutConfirmation}
            className="rounded-md bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {showLogoutConfirmation && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <LogOut className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Logout Confirmation
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to logout?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleLogout}
                >
                  Confirm Logout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCloseLogoutConfirmation}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}
