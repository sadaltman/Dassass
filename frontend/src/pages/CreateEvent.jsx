// Create Event Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'normal',
    eligibility: 'all',
    regDeadline: '',
    startDate: '',
    endDate: '',
    regLimit: 0,
    regFee: 0,
    tags: '',
    merchDetails: {
      hasMerchandise: false,
      merchName: '',
      variants: [{ name: 'Default', price: 0, stock: 0 }]
    },
    customFields: [] // Custom registration form fields
  });

  // Custom form field types
  const fieldTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File Upload' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMerchChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      merchDetails: {
        ...formData.merchDetails,
        [e.target.name]: value
      }
    });
  };

  // Merchandise variants handlers
  const addVariant = () => {
    setFormData({
      ...formData,
      merchDetails: {
        ...formData.merchDetails,
        variants: [...formData.merchDetails.variants, { name: '', price: 0, stock: 0 }]
      }
    });
  };

  const removeVariant = (index) => {
    if (formData.merchDetails.variants.length <= 1) return;
    const newVariants = formData.merchDetails.variants.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      merchDetails: {
        ...formData.merchDetails,
        variants: newVariants
      }
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.merchDetails.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({
      ...formData,
      merchDetails: {
        ...formData.merchDetails,
        variants: newVariants
      }
    });
  };

  // Custom form fields handlers
  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        { name: '', type: 'text', required: false, options: [] }
      ]
    });
  };

  const removeCustomField = (index) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((_, i) => i !== index)
    });
  };

  const updateCustomField = (index, field, value) => {
    const newFields = [...formData.customFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({
      ...formData,
      customFields: newFields
    });
  };

  const addFieldOption = (fieldIndex) => {
    const newFields = [...formData.customFields];
    newFields[fieldIndex].options = [...(newFields[fieldIndex].options || []), ''];
    setFormData({ ...formData, customFields: newFields });
  };

  const updateFieldOption = (fieldIndex, optionIndex, value) => {
    const newFields = [...formData.customFields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFormData({ ...formData, customFields: newFields });
  };

  const removeFieldOption = (fieldIndex, optionIndex) => {
    const newFields = [...formData.customFields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, customFields: newFields });
  };

  // Move field up
  const moveFieldUp = (index) => {
    if (index === 0) return;
    const newFields = [...formData.customFields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFormData({ ...formData, customFields: newFields });
  };

  // Move field down
  const moveFieldDown = (index) => {
    if (index === formData.customFields.length - 1) return;
    const newFields = [...formData.customFields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFormData({ ...formData, customFields: newFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('organizerToken');
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    try {
      const eventData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        regLimit: parseInt(formData.regLimit) || 0,
        regFee: parseFloat(formData.regFee) || 0,
        customForm: { fields: formData.customFields.filter(f => f.name.trim() !== '') }
      };

      if (formData.merchDetails.hasMerchandise) {
        eventData.merchDetails = {
          hasMerchandise: true,
          merchName: formData.merchDetails.merchName,
          variants: formData.merchDetails.variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0
          }))
        };
      }

      await axios.post(`${API_URL}/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Organizer Panel</h1>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="border-2 border-black p-6">
          
          {/* Basic Info */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="mb-4">
              <label className="block font-bold mb-2">Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold mb-2">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="normal">Normal Event</option>
                  <option value="merchandise">Event with Merchandise</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Eligibility *</label>
                <select
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="all">All</option>
                  <option value="iiit-only">IIIT Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Dates & Times</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold mb-2">Registration Deadline *</label>
                <input
                  type="datetime-local"
                  name="regDeadline"
                  value={formData.regDeadline}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black p-2"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black p-2"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black p-2"
                />
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Registration Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">Registration Limit (0 = unlimited)</label>
                <input
                  type="number"
                  name="regLimit"
                  value={formData.regLimit}
                  onChange={handleChange}
                  min="0"
                  className="w-full border-2 border-black p-2"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Registration Fee (₹)</label>
                <input
                  type="number"
                  name="regFee"
                  value={formData.regFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border-2 border-black p-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-bold mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tech, music, sports"
                className="w-full border-2 border-black p-2"
              />
            </div>
          </div>

          {/* Merchandise */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Merchandise (Optional)</h2>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasMerchandise"
                  checked={formData.merchDetails.hasMerchandise}
                  onChange={handleMerchChange}
                  className="mr-2"
                />
                <span className="font-bold">This event has merchandise</span>
              </label>
            </div>

            {formData.merchDetails.hasMerchandise && (
              <div className="border border-gray-300 p-4">
                <div className="mb-4">
                  <label className="block font-bold mb-2">Merchandise Name</label>
                  <input
                    type="text"
                    name="merchName"
                    value={formData.merchDetails.merchName}
                    onChange={handleMerchChange}
                    placeholder="e.g., Festival T-Shirt"
                    className="w-full border-2 border-black p-2"
                  />
                </div>

                <h3 className="font-bold mb-2">Variants (sizes, colors, etc.)</h3>
                <div className="flex gap-2 mb-2 text-sm font-semibold text-gray-600">
                  <span className="flex-1">Variant Name</span>
                  <span className="w-24 text-center">Price (₹)</span>
                  <span className="w-24 text-center">Stock</span>
                  {formData.merchDetails.variants.length > 1 && <span className="w-10"></span>}
                </div>
                {formData.merchDetails.variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Variant name (e.g., Size M)"
                      className="flex-1 border-2 border-black p-2"
                    />
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="Price"
                      min="0"
                      className="w-24 border-2 border-black p-2"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      placeholder="Stock"
                      min="0"
                      className="w-24 border-2 border-black p-2"
                    />
                    {formData.merchDetails.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="px-3 py-2 bg-red-500 text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-2 px-4 py-2 border-2 border-black hover:bg-gray-100"
                >
                  + Add Variant
                </button>
              </div>
            )}
          </div>

          {/* Custom Registration Form Builder */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Custom Registration Fields (Optional)</h2>
            <p className="text-gray-600 mb-4">Add custom fields to collect additional information during registration. You can reorder fields using the arrow buttons.</p>
            
            {formData.customFields.map((field, index) => (
              <div key={index} className="border border-gray-300 p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Field #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveFieldUp(index)}
                      disabled={index === 0}
                      className="px-2 py-1 border border-black disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFieldDown(index)}
                      disabled={index === formData.customFields.length - 1}
                      className="px-2 py-1 border border-black disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="px-3 py-1 bg-red-500 text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-bold mb-1">Field Name</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                      placeholder="e.g., Team Name, T-Shirt Size"
                      className="w-full border-2 border-black p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Field Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                      className="w-full border-2 border-black p-2"
                    >
                      {fieldTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateCustomField(index, 'required', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Required field</span>
                </label>
                
                {field.type === 'dropdown' && (
                  <div>
                    <label className="block text-sm font-bold mb-1">Options</label>
                    {(field.options || []).map((opt, optIndex) => (
                      <div key={optIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateFieldOption(index, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 border border-black p-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeFieldOption(index, optIndex)}
                          className="px-3 bg-red-500 text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addFieldOption(index)}
                      className="text-sm px-3 py-1 border border-black hover:bg-gray-100"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCustomField}
              className="px-4 py-2 border-2 border-black hover:bg-gray-100"
            >
              + Add Custom Field
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
