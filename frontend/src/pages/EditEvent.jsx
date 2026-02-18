// Edit Event Form - Draft events get full edits, Published events get limited edits
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eventStatus, setEventStatus] = useState('draft');
  
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
    customFields: []
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

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const token = localStorage.getItem('organizerToken');
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    try {
      const response = await axios.get(`https://dassass.onrender.com/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const event = response.data.event;
      setEventStatus(event.status);
      
      // Only draft and published events can be edited
      if (event.status !== 'draft' && event.status !== 'published') {
        alert('Only draft and published events can be edited.');
        navigate(`/organizer/events/${id}`);
        return;
      }
      
      // Format dates for datetime-local input
      const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toISOString().slice(0, 16);
      };
      
      setFormData({
        name: event.name || '',
        description: event.description || '',
        eventType: event.eventType || 'normal',
        eligibility: event.eligibility || 'all',
        regDeadline: formatDate(event.regDeadline),
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        regLimit: event.regLimit || 0,
        regFee: event.regFee || 0,
        tags: (event.tags || []).join(', '),
        merchDetails: {
          hasMerchandise: event.merchDetails?.variants?.length > 0,
          merchName: event.merchDetails?.merchName || '',
          variants: event.merchDetails?.variants?.length > 0 
            ? event.merchDetails.variants 
            : [{ name: 'Default', price: 0, stock: 0 }]
        },
        customFields: event.customForm?.fields || []
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load event');
      setLoading(false);
    }
  };

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
    setSaving(true);
    setError('');

    const token = localStorage.getItem('organizerToken');

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

      await axios.put(`https://dassass.onrender.com/api/events/${id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Event updated successfully!');
      navigate(`/organizer/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-black text-white p-4 border-b-4 border-black">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold">Organizer Panel</h1>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Organizer Panel</h1>
          <button
            onClick={() => navigate(`/organizer/events/${id}`)}
            className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Edit Event {eventStatus === 'published' ? '(Published — Limited Edits)' : '(Draft)'}
        </h1>
        
        {eventStatus === 'published' && (
          <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-3 mb-4">
            This event is published. You can only edit the description, registration deadline, and registration limit.
          </div>
        )}
        
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
                disabled={eventStatus === 'published'}
                className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                  disabled={eventStatus === 'published'}
                  className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                  disabled={eventStatus === 'published'}
                  className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                  disabled={eventStatus === 'published'}
                  className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                  disabled={eventStatus === 'published'}
                  className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                  disabled={eventStatus === 'published'}
                  className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                disabled={eventStatus === 'published'}
                className="w-full border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Merchandise - only for draft events */}
          {eventStatus === 'draft' && (
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
                {formData.merchDetails.variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Variant name"
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
          )}

          {/* Custom Registration Form Builder - only for draft events */}
          {eventStatus === 'draft' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Custom Registration Fields</h2>
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
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/organizer/events/${id}`)}
              className="px-6 py-3 border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
