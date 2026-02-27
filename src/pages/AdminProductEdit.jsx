import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import AdminHeader from '../components/AdminHeader'
import { getToken } from '../utils/tokenManager'
import './AdminProductEdit.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001'

function AdminProductEdit() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    stockQty: 0,
    sku: '',
    status: 'active',
    images: [],
    colorVariants: [],
    features: [],
  })
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [colorVariantForm, setColorVariantForm] = useState({
    wattage: '',
    colorName: '',
    colorCode: '#000000',
    images: [],
    price: 0,
    stockQty: 0,
    sku: '',
  })
  const [colorImageInput, setColorImageInput] = useState('')
  const [featureForm, setFeatureForm] = useState({
    name: '',
    value: '',
    price: 0,
    stockQty: 0,
  })
  const [editingVariantIndex, setEditingVariantIndex] = useState(null)
  const [editingVariantStock, setEditingVariantStock] = useState(0)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')

  const normalizeFeatures = (features) => {
    if (!features) return []
    if (Array.isArray(features)) {
      return features
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          name: item.name || '',
          value: item.value || '',
          price: Number(item.price) || 0,
          stockQty: Number(item.stockQty) || 0,
        }))
    }
    if (typeof features === 'object') {
      return Object.entries(features).map(([name, value]) => ({
        name,
        value: value ?? '',
        price: 0,
        stockQty: 0,
      }))
    }
    return []
  }

  const getTotalStock = (data) => {
    const colorStock = (data.colorVariants || []).reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0)
    const featureStock = (data.features || []).reduce((sum, f) => sum + (Number(f.stockQty) || 0), 0)
    if ((data.colorVariants || []).length > 0 || (data.features || []).length > 0) {
      return colorStock + featureStock
    }
    return Number(data.stockQty) || 0
  }

  useEffect(() => {
    const fetchOne = async () => {
      if (isNew) return
      try {
        const token = getToken('admin')
        const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load product')
        setForm({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          price: data.price || 0,
          stockQty: data.stockQty || 0,
          sku: data.sku || '',
          status: data.status || 'active',
          images: data.images || [],
          colorVariants: data.colorVariants || [],
          features: normalizeFeatures(data.features),
        })
        setImageUrlInput('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [id, isNew])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'stockQty' ? Number(value) : value }))
  }

  const handleCategoryChange = (e) => {
    const { value } = e.target
    setForm((prev) => ({
      ...prev,
      category: value,
      subcategory: '',
    }))
  }

  const categorySubcategoryMap = {
    'Switches & Sockets': [
      { value: 'modular-6a', label: 'Modular Switches (6A)' },
      { value: 'modular-16a', label: 'Modular Switches (16A)' },
      { value: 'socket', label: 'Sockets' },
      { value: 'fan-regulator', label: 'Fan Regulators' },
      { value: 'switchboard', label: 'Modular combined Plate' },
    ],
    'Wires & Cables': [
      { value: 'wire-1sqmm', label: '1 sq mm Wire (per meter)' },
      { value: 'wire-1.5sqmm', label: '1.5 sq mm Wire (per meter)' },
      { value: 'wire-2.5sqmm', label: '2.5 sq mm Wire (per meter)' },
      { value: 'service-wire', label: '4 sq mm Wire (per meter)' },
      { value: 'lan-cable', label: '6 sq mm Wire (per meter)' },
    ],
    Lighting: [
      { value: 'tube-light', label: 'Tube Light' },
      { value: 'ceiling-light', label: 'Ceiling Light' },
      { value: 'bulb', label: 'Bulb' },
      { value: 'decorative-light', label: 'Decorative Light' },
    ],
    Fans: [
      { value: 'ceiling-fan', label: 'Ceiling Fan' },
      { value: 'table-fan', label: 'Table Fan' },
      { value: 'pedestal-fan', label: 'Pedestal Fan' },
      { value: 'exhaust-fan', label: 'Exhaust Fan' },
    ],
    'Electrical Accessories': [
      { value: 'extension-board', label: 'Extension Board' },
      { value: 'spike-guard', label: 'Spike Guard' },
      { value: 'adapter-plug', label: 'Adapter Plug' },
      { value: 'bulb-holder', label: 'Bulb Holder' },
      { value: 'insulation-tape', label: 'Insulation Tape' },
      { value: 'cable-ties', label: 'Cable Ties' },
      { value: 'conduit-pipe', label: 'Conduit Pipe (10 ft)' },
    ],
    Fasteners: [
      { value: 'screws', label: 'Screws' },
      { value: 'bolts', label: 'Bolts' },
      { value: 'nuts', label: 'Nuts' },
      { value: 'washers', label: 'Washers' },
    ],
  }

  const selectedSubcategories = categorySubcategoryMap[form.category] || []

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }))
      setImageUrlInput('')
    }
  }

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleColorVariantChange = (e) => {
    const { name, value } = e.target
    setColorVariantForm((prev) => ({
      ...prev,
      [name]: (name === 'stockQty' || name === 'price') ? Number(value) : value,
    }))
  }

  const handleAddColorImage = () => {
    if (colorImageInput.trim()) {
      setColorVariantForm((prev) => ({
        ...prev,
        images: [...prev.images, colorImageInput.trim()],
      }))
      setColorImageInput('')
    }
  }

  const handleRemoveColorImage = (index) => {
    setColorVariantForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleAddColorVariant = () => {
    if (!colorVariantForm.colorName.trim()) {
      toast.error('Color name is required')
      return
    }
    if (colorVariantForm.images.length === 0) {
      toast.error('At least one image is required for the color variant')
      return
    }

    setForm((prev) => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { ...colorVariantForm }],
    }))

    // Reset color variant form
    setColorVariantForm({
      wattage: '',
      colorName: '',
      colorCode: '#000000',
      images: [],
      price: 0,
      stockQty: 0,
      sku: '',
    })
    setColorImageInput('')
    toast.success('Color variant added')
  }

  const handleRemoveColorVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }))
  }

  const handleEditVariantStock = (index) => {
    setEditingVariantIndex(index)
    setEditingVariantStock(form.colorVariants[index].stockQty)
  }

  const handleSaveVariantStock = () => {
    if (editingVariantIndex === null) return
    
    setForm((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.map((v, i) => 
        i === editingVariantIndex ? { ...v, stockQty: editingVariantStock } : v
      ),
    }))
    
    setEditingVariantIndex(null)
    setEditingVariantStock(0)
    toast.success('Stock quantity updated')
  }

  const handleCancelVariantEdit = () => {
    setEditingVariantIndex(null)
    setEditingVariantStock(0)
  }

  const handleFeatureChange = (e) => {
    const { name, value } = e.target
    setFeatureForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'stockQty' ? Number(value) : value }))
  }

  const handleAddFeature = () => {
    if (!featureForm.name.trim() || !featureForm.value.trim()) {
      toast.error('Feature name and value are required')
      return
    }

    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          name: featureForm.name.trim(),
          value: featureForm.value.trim(),
          price: Number(featureForm.price) || 0,
          stockQty: Number(featureForm.stockQty) || 0,
        },
      ],
    }))

    setFeatureForm({ name: '', value: '', price: 0, stockQty: 0 })
    toast.success('Feature added')
  }

  const handleRemoveFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleFeatureItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (
        i === index ? { ...f, [field]: field === 'price' || field === 'stockQty' ? Number(value) : value } : f
      )),
    }))
  }

  const handleAddFeatureValue = (featureName) => {
    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          name: featureName,
          value: '',
          price: 0,
          stockQty: 0,
        },
      ],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = getToken('admin')
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? `${API_BASE}/api/admin/products` : `${API_BASE}/api/admin/products/${id}`
      const payload = {
        ...form,
        stockQty: getTotalStock(form),
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Save failed')
      toast.success('Saved')
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="page-loading">Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <>
      <AdminHeader />
      <main className="main-content admin-product-edit">
        <div className="container">
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <h2 className="page-title">{isNew ? 'Add' : 'Edit'} Product</h2>
            <form onSubmit={handleSubmit} className="form-grid">
            <label> Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label> Description
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label> Category
              <select name="category" value={form.category} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                <option value="Switches & Sockets">Switches & Sockets</option>
                <option value="Wires & Cables">Wires & Cables</option>
                <option value="Lighting">Lighting</option>
                <option value="Fans">Fans</option>
                <option value="Electrical Accessories">Electrical Accessories</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Hand Tools">Hand Tools</option>
                <option value="Power Tools">Power Tools</option>
                <option value="Construction Hardware">Construction Hardware</option>
                <option value="Plumbing Hardware">Plumbing Hardware</option>
              </select>
            </label>
            {form.category !== 'Electrical Accessories' && 
             form.category !== 'Hand Tools' && 
             form.category !== 'Power Tools' && 
             form.category !== 'Construction Hardware' && 
             form.category !== 'Plumbing Hardware' && (
              <label> Subcategory
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={!form.category}
                  required={!!form.category}
                >
                  <option value="">Select Subcategory</option>
                  {selectedSubcategories.map((subcat) => (
                    <option key={subcat.value} value={subcat.value}>{subcat.label}</option>
                  ))}
                </select>
              </label>
            )}
            <label> Price
              <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
            </label>
            <label> Stock Qty
              <input 
                type="number" 
                name="stockQty" 
                value={getTotalStock(form)} 
                onChange={handleChange} 
                disabled={form.colorVariants.length > 0 || form.features.length > 0}
                title={form.colorVariants.length > 0 || form.features.length > 0 ? 'Total stock is calculated from variants and extra features' : ''}
                style={form.colorVariants.length > 0 || form.features.length > 0 ? { background: '#f3f4f6', cursor: 'not-allowed' } : {}}
                required 
              />
              {(form.colorVariants.length > 0 || form.features.length > 0) && (
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  Stock is managed per color variant and extra feature below
                </p>
              )}
            </label>
            <label> SKU
              <input name="sku" value={form.sku} onChange={handleChange} />
            </label>
            <label> Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Product Images
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    style={{ flex: 1, padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn"
                    style={{ background: '#10b981', color: 'white' }}
                  >
                    Add Image
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.images.map((img, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e9ecef' }} onError={(e) => { e.target.style.display = 'none' }} />
                        <input type="text" value={img} readOnly style={{ flex: 1, padding: '0.5rem', border: '1px solid #e9ecef', borderRadius: '4px', fontSize: '0.85rem' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length === 0 && (
                  <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>No images added. Add image URLs above.</p>
                )}
              </div>
            </label>

            {/* Color Variants Section */}
            <div style={{ gridColumn: '1 / -1', marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e9ecef' }}>
              <h3 style={{ marginBottom: '1rem', color: '#2874f0', fontSize: '1.3rem' }}>🎨 Color Variants</h3>
              
              {/* Add Color Variant Form */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Color</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <label>
                    Color Name
                    <input
                      name="colorName"
                      value={colorVariantForm.colorName}
                      onChange={handleColorVariantChange}
                      placeholder="e.g., Red, Blue, Black, Cool Day Light"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>
                  
                  <label>
                    Wattage (Optional)
                    <input
                      name="wattage"
                      value={colorVariantForm.wattage}
                      onChange={handleColorVariantChange}
                      placeholder="e.g., 15W, 20W, 5W"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <label>
                    Color Code
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        name="colorCode"
                        value={colorVariantForm.colorCode}
                        onChange={handleColorVariantChange}
                        style={{ width: '60px', height: '42px', border: '2px solid #e9ecef', borderRadius: '8px' }}
                      />
                      <input
                        type="text"
                        value={colorVariantForm.colorCode}
                        readOnly
                        style={{ flex: 1, padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', background: '#f8f9fa' }}
                      />
                    </div>
                  </label>
                  
                  <label>
                    Stock Quantity
                    <input
                      type="number"
                      name="stockQty"
                      value={colorVariantForm.stockQty}
                      onChange={handleColorVariantChange}
                      placeholder="0"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <label>
                    Color Price (Optional)
                    <input
                      type="number"
                      name="price"
                      value={colorVariantForm.price}
                      onChange={handleColorVariantChange}
                      placeholder="Leave 0 to use base product price"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      If set, this price will be used when this color is selected. Otherwise, the base product price will be used.
                    </small>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                  
                  <label>
                    SKU (Optional)
                    <input
                      name="sku"
                      value={colorVariantForm.sku}
                      onChange={handleColorVariantChange}
                      placeholder="e.g., PROD-RED-001"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'block', marginBottom: '1rem' }}>
                  Color Images
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="url"
                        placeholder="Enter image URL for this color"
                        value={colorImageInput}
                        onChange={(e) => setColorImageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColorImage())}
                        style={{ flex: 1, padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddColorImage}
                        style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Add Image
                      </button>
                    </div>
                    {colorVariantForm.images.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {colorVariantForm.images.map((img, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '6px' }}>
                            <img src={img} alt={`Color preview ${idx + 1}`} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e9ecef' }} onError={(e) => { e.target.style.display = 'none' }} />
                            <input type="text" value={img} readOnly style={{ flex: 1, padding: '0.5rem', border: '1px solid #e9ecef', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <button
                              type="button"
                              onClick={() => handleRemoveColorImage(idx)}
                              style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                <button
                  type="button"
                  onClick={handleAddColorVariant}
                  style={{ width: '100%', padding: '1rem', background: '#2874f0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}
                >
                  ➕ Add Color Variant
                </button>
              </div>

              {/* Display Added Color Variants */}
              {form.colorVariants.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Added Colors ({form.colorVariants.length})</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {form.colorVariants.map((variant, idx) => (
                      <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '2px solid #e9ecef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: variant.colorCode, border: '2px solid #e9ecef' }}></div>
                            <div>
                              <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{variant.colorName}</h5>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                {variant.wattage && `${variant.wattage} • `}
                                {variant.price > 0 && `₹${variant.price} • `}
                                Stock: {variant.stockQty} {variant.sku && `• SKU: ${variant.sku}`}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {editingVariantIndex === idx ? (
                              <>
                                <input
                                  type="number"
                                  value={editingVariantStock}
                                  onChange={(e) => setEditingVariantStock(Number(e.target.value))}
                                  style={{ width: '90px', padding: '0.5rem', border: '2px solid #10b981', borderRadius: '6px', fontSize: '0.95rem' }}
                                  placeholder="Stock"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveVariantStock}
                                  style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelVariantEdit}
                                  style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditVariantStock(idx)}
                                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorVariant(idx)}
                                  style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                          {variant.images.map((img, imgIdx) => (
                            <img key={imgIdx} src={img} alt={`${variant.colorName} ${imgIdx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e9ecef' }} onError={(e) => { e.target.style.display = 'none' }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Extra Features Section */}
            <div style={{ gridColumn: '1 / -1', marginTop: '2rem', padding: '1.5rem', background: '#fff3e0', borderRadius: '12px', border: '2px solid #ffb74d' }}>
              <h3 style={{ marginBottom: '1rem', color: '#f57c00', fontSize: '1.3rem' }}>⚡ Extra Features</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Add custom specifications like Voltage, Length, Material, Wattage, etc., with optional price and stock.
              </p>
              
              {/* Add Feature Form */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Feature</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                  <label>
                    Feature Name
                    <input
                      name="name"
                      value={featureForm.name}
                      onChange={handleFeatureChange}
                      placeholder="e.g., Voltage, Length, Material"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>
                  
                  <label>
                    Feature Value
                    <input
                      name="value"
                      value={featureForm.value}
                      onChange={handleFeatureChange}
                      placeholder="e.g., 220V, 100cm, Copper"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>

                  <label>
                    Feature Price (Optional)
                    <input
                      type="number"
                      name="price"
                      value={featureForm.price}
                      onChange={handleFeatureChange}
                      placeholder="0"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>

                  <label>
                    Feature Stock
                    <input
                      type="number"
                      name="stockQty"
                      value={featureForm.stockQty}
                      onChange={handleFeatureChange}
                      placeholder="0"
                      style={{ padding: '0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', width: '100%' }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAddFeature}
                    style={{ padding: '0.75rem 1.5rem', background: '#f57c00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                  >
                    ➕ Add Feature
                  </button>
                </div>
              </div>

              {/* Display Added Features */}
              {form.features.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Added Features ({form.features.length})</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {Object.entries(form.features.reduce((acc, feature, idx) => {
                      const key = feature.name || 'Feature'
                      if (!acc[key]) acc[key] = []
                      acc[key].push({ ...feature, index: idx })
                      return acc
                    }, {})).map(([featureName, entries]) => (
                      <div key={featureName} style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '2px solid #ffe0b2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{ fontWeight: '700', color: '#f57c00', fontSize: '1rem' }}>{featureName}</div>
                          <button
                            type="button"
                            onClick={() => handleAddFeatureValue(featureName)}
                            style={{ padding: '0.4rem 0.75rem', background: '#ffb74d', color: '#5d4037', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                          >
                            ➕ Add Value
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {entries.map((entry) => (
                            <div key={`${featureName}-${entry.index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px auto', gap: '0.75rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={entry.value}
                                onChange={(e) => handleFeatureItemChange(entry.index, 'value', e.target.value)}
                                placeholder="Value"
                                style={{ padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '8px' }}
                              />
                              <input
                                type="number"
                                value={entry.price}
                                onChange={(e) => handleFeatureItemChange(entry.index, 'price', e.target.value)}
                                placeholder="Price"
                                style={{ padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '8px' }}
                              />
                              <input
                                type="number"
                                value={entry.stockQty}
                                onChange={(e) => handleFeatureItemChange(entry.index, 'stockQty', e.target.value)}
                                placeholder="Stock"
                                style={{ padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '8px' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(entry.index)}
                                style={{ padding: '0.45rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.features.length === 0 && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                  No features added yet. Use the form above to add custom specifications.
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Save Product</button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/admin/products')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </main>
    </>
  )
}

export default AdminProductEdit
