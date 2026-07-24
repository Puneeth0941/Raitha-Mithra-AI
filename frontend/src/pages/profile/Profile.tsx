import { useState, useEffect } from "react";
import { FaPhone, FaSeedling, FaRulerCombined, FaCamera, FaSave, FaEdit, FaSpinner } from "react-icons/fa";
import { getProfile, updateProfile, uploadProfilePhoto } from "../../services/profileService";
import type { ProfileData } from "../../services/profileService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Ramesh Gowda",
    phone: "9845012345",
    village: "Thirthahalli",
    profile_photo: "",
    main_crop: "Arecanut",
    farm_area: "5"
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setPhotoUploading(true);
      const res = await uploadProfilePhoto(file);
      setProfile({
        ...profile,
        profile_photo: res.photo_url
      });
      setMessage("Profile photo uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateProfile(profile);
      setProfile(updated);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-green-600 gap-3">
        <FaSpinner className="animate-spin text-3xl" />
        <span className="text-lg font-semibold">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl text-white p-8 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold">👨‍🌾 Farmer Profile</h1>
          <p className="text-green-100 mt-1">Manage your personal and farm details</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-white text-green-800 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-green-50 transition flex items-center gap-2"
        >
          {isEditing ? <FaEdit /> : <FaEdit />}
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-center font-semibold">
          {message}
        </div>
      )}

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-36 h-36 rounded-full border-4 border-green-600 overflow-hidden shadow-lg bg-green-100 flex items-center justify-center">
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl text-green-700">👨‍🌾</span>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-green-600 text-white p-2.5 rounded-full shadow-md cursor-pointer hover:bg-green-700 transition">
                <FaCamera className="text-sm" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {photoUploading && <span className="text-xs text-green-600 animate-pulse mb-2">Uploading photo...</span>}

          <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">📍 {profile.village}</p>

          <div className="w-full border-t border-gray-100 my-6 pt-6 space-y-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <FaPhone className="text-green-600" /> Mobile Number:
              </span>
              <strong className="text-gray-800">{profile.phone}</strong>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <FaSeedling className="text-green-600" /> Main Crop:
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {profile.main_crop || "Arecanut"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <FaRulerCombined className="text-green-600" /> Farm Area:
              </span>
              <strong className="text-gray-800">{profile.farm_area || "5"} Acres</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form / Detailed Card */}
        <div className="md:col-span-7 bg-white rounded-3xl p-8 shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
            {isEditing ? "Edit Profile Information" : "Profile Details"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Village */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Village / Location
              </label>
              <input
                type="text"
                name="village"
                value={profile.village}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Main Crop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Main Crop
              </label>
              <select
                name="main_crop"
                value={profile.main_crop || "Arecanut"}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Arecanut">Arecanut</option>
                <option value="Coconut">Coconut</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Pepper">Pepper</option>
                <option value="Cardamom">Cardamom</option>
              </select>
            </div>

            {/* Farm Area (Acres) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Farm Area (Acres)
              </label>
              <input
                type="text"
                name="farm_area"
                value={profile.farm_area || "5"}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Photo URL / File Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Profile Photo URL
              </label>
              <input
                type="text"
                name="profile_photo"
                placeholder="http://example.com/photo.jpg"
                value={profile.profile_photo || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 disabled:bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {isEditing && (
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
