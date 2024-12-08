import { useState } from "react";
import { useSecretSpots } from "../contexts/SecretSpotsContext";
import { useWallet } from "../contexts/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Image,
  Info,
  X,
  Camera,
  Loader,
  AlertCircle,
  ChevronDown,
  Upload,
} from "lucide-react";

const CreateSpot = ({ onClose }) => {
  const { createSpot, loading, contractError, isRegisteredUser } =
    useSecretSpots();
  const { account } = useWallet();
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState([]);
  const [spotData, setSpotData] = useState({
    name: "",
    description: "",
    category: "FOOD_BEVERAGES",
    city: "",
    state: "",
    address: "",
    latitude: "",
    longitude: "",
    photos: [],
  });

  const categories = {
    FOOD_BEVERAGES: { icon: "🍽️", label: "Food & Beverages" },
    NATURE: { icon: "🌲", label: "Nature" },
    CULTURAL: { icon: "🎭", label: "Cultural" },
    PHOTO: { icon: "📸", label: "Photo Spot" },
    HISTORICAL: { icon: "🏛️", label: "Historical" },
    LOCAL_EXPERIENCE: { icon: "🌟", label: "Local Experience" },
    NIGHTLIFE: { icon: "🌙", label: "Nightlife" },
    I_KNOW_A_PLACE: { icon: "🎯", label: "I Know a Place" },
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSpotData({ ...spotData, photos: files });

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const validateStep1 = (data) => {
    if (!data.name?.trim()) return "Spot name is required";
    if (!data.description?.trim()) return "Description is required";
    if (!data.category?.trim()) return "Category is required";
    return null;
  };

  const validateStep2 = (data) => {
    if (!data.city?.trim()) return "City is required";
    if (!data.state?.trim()) return "State is required";
    if (!data.address?.trim()) return "Address is required";
    if (!data.latitude) return "Latitude is required";
    if (!data.longitude) return "Longitude is required";
    return null;
  };

  const validateStep3 = (data) => {
    if (!data.photos || data.photos.length === 0) {
      return "At least one photo is required";
    }
    return null;
  };

  const handleNextStep = () => {
    let stepError = null;

    if (currentStep === 1) {
      stepError = validateStep1(spotData);
    } else if (currentStep === 2) {
      stepError = validateStep2(spotData);
    }

    if (stepError) {
      setError(stepError);
      return;
    }

    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate all steps
    const step1Error = validateStep1(spotData);
    const step2Error = validateStep2(spotData);
    const step3Error = validateStep3(spotData);

    if (step1Error || step2Error || step3Error) {
      setError(step1Error || step2Error || step3Error);
      return;
    }

    try {
      if (contractError) throw new Error(contractError);
      if (!account) throw new Error("Please connect your wallet first");
      if (!isRegisteredUser)
        throw new Error("Please register before creating a spot");

      // Format the data before sending
      const formattedData = {
        ...spotData,
        latitude: parseFloat(spotData.latitude),
        longitude: parseFloat(spotData.longitude),
      };

      await createSpot(formattedData);
      onClose();
    } catch (error) {
      setError(error.message);
      console.error("Error creating spot:", error);
    }
  };

  const renderAuthError = (message) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg"
    >
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Authentication Required
      </h3>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Close
      </button>
    </motion.div>
  );

  if (!account)
    return renderAuthError("Please connect your wallet to create a spot");
  if (!isRegisteredUser)
    return renderAuthError("Please register to create spots");
  if (contractError) return renderAuthError(contractError);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Create New Secret Spot
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 3 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step < currentStep ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Basic Info</span>
          <span className="text-sm text-gray-600">Location</span>
          <span className="text-sm text-gray-600">Photos</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"
        >
          <div className="flex items-center">
            <Info className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700 font-medium">Spot Name</span>
                  <input
                    type="text"
                    value={spotData.name}
                    onChange={(e) =>
                      setSpotData({ ...spotData, name: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter spot name"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium">Description</span>
                  <textarea
                    value={spotData.description}
                    onChange={(e) =>
                      setSpotData({ ...spotData, description: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe your secret spot"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium">Category</span>
                  <div className="relative mt-1">
                    <select
                      value={spotData.category}
                      onChange={(e) =>
                        setSpotData({ ...spotData, category: e.target.value })
                      }
                      className="p-2 block w-full appearance-none rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {Object.entries(categories).map(
                        ([value, { icon, label }]) => (
                          <option key={value} value={value}>
                            {icon} {label}
                          </option>
                        )
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">City</span>
                  <input
                    type="text"
                    value={spotData.city}
                    onChange={(e) =>
                      setSpotData({ ...spotData, city: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium">State</span>
                  <input
                    type="text"
                    value={spotData.state}
                    onChange={(e) =>
                      setSpotData({ ...spotData, state: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-gray-700 font-medium">Address</span>
                <input
                  type="text"
                  value={spotData.address}
                  onChange={(e) =>
                    setSpotData({ ...spotData, address: e.target.value })
                  }
                  className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={spotData.latitude}
                    onChange={(e) =>
                      setSpotData({ ...spotData, latitude: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={spotData.longitude}
                    onChange={(e) =>
                      setSpotData({ ...spotData, longitude: e.target.value })
                    }
                    className="p-2 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="block text-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-gray-600">
                      <span className="text-blue-500 hover:text-blue-600">
                        Upload photos
                      </span>{" "}
                      or drag and drop
                    </div>
                  </div>
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {previewImages.map((preview, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = [...previewImages];
                          const newPhotos = [...spotData.photos];
                          newPreviews.splice(index, 1);
                          newPhotos.splice(index, 1);
                          setPreviewImages(newPreviews);
                          setSpotData({ ...spotData, photos: newPhotos });
                        }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Spot</span>
              )}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default CreateSpot;
