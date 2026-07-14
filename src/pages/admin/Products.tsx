import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Sliders, Check, X, RefreshCw } from 'lucide-react';
import api from '@/utils/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog / Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [status, setStatus] = useState<'ENABLED' | 'DISABLED'>('ENABLED');
  const [tags, setTags] = useState<string[]>([]);

  // Custom Overrides
  const [descriptionBox1, setDescriptionBox1] = useState('');
  const [descriptionBox2, setDescriptionBox2] = useState('');
  const [shippingTimeOverride, setShippingTimeOverride] = useState('');
  const [shippingPriceOverride, setShippingPriceOverride] = useState('');

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data.products);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const handleEditClick = (p: any) => {
    setEditId(p._id);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category?._id || p.category || '');
    setPrice(p.price.toString());
    setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setStock(p.stock.toString());
    setImages(p.images || []);
    setStatus(p.status);
    setTags(p.tags || []);
    setDescriptionBox1(p.descriptionBox1 || '');
    setDescriptionBox2(p.descriptionBox2 || '');
    setShippingTimeOverride(p.shippingTimeOverride || '');
    setShippingPriceOverride(p.shippingPriceOverride !== undefined && p.shippingPriceOverride !== null ? p.shippingPriceOverride.toString() : '');
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setDiscountPrice('');
    setStock('');
    setImages([]);
    setStatus('ENABLED');
    setTags([]);
    setDescriptionBox1('');
    setDescriptionBox2('');
    setShippingTimeOverride('');
    setShippingPriceOverride('');
    setIsEditing(true);
  };

  const handleTagChange = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      category,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      stock: parseInt(stock, 10),
      images: images,
      status,
      tags,
      descriptionBox1,
      descriptionBox2,
      shippingTimeOverride,
      shippingPriceOverride: shippingPriceOverride ? parseFloat(shippingPriceOverride) : undefined
    };

    try {
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        alert('Product modified successfully');
      } else {
        await api.post('/products', payload);
        alert('Product created successfully');
      }
      setIsEditing(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.error || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this piece?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchInventory();
    } catch (err) {}
  };

  const handleStatusToggle = async (p: any) => {
    const nextStatus = p.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await api.put(`/products/${p._id}`, { status: nextStatus });
      fetchInventory();
    } catch (err) {}
  };

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Inventory Studio</h1>
          <p className="text-xs text-gray-400 font-light mt-0.5">Manage luxury jewelry pieces and stock tags</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} /> Add Jewelry Piece
        </button>
      </div>

      {/* Editor Drawer / modal */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white border border-gold/15 p-6 rounded-lg space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3 flex justify-between items-center">
            <span>{editId ? 'Modify Jewelry Details' : 'Introduce New Jewelry Piece'}</span>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-600"><X size={16} /></button>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Retail Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Stock Count</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Product Images</label>
              
              {/* Existing Images Gallery */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 border border-gold/10 rounded overflow-hidden group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  id="newImageUrl"
                  placeholder="Paste image URL here or browse to upload..."
                  className="flex-1 bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-[11px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setImages(prev => [...prev, val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('newImageUrl') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) {
                      setImages(prev => [...prev, val]);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-luxury-charcoal text-white hover:bg-gold rounded font-outfit uppercase font-bold text-[9px] tracking-wider"
                >
                  Add URL
                </button>
                <label className={`px-4 py-2 border border-gold/20 hover:border-gold text-gold hover:bg-gold/5 rounded font-outfit font-bold uppercase tracking-wider cursor-pointer text-[10px] inline-flex items-center justify-center shrink-0 ${isUploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isUploadingImages ? 'Uploading...' : 'Browse'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImages}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      // Helper: read a single file as base64
                      const readFileAsBase64 = (file: File): Promise<string> =>
                        new Promise((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        });

                      setIsUploadingImages(true);
                      const uploadedUrls: string[] = [];
                      const failedNames: string[] = [];

                      // Upload sequentially and only announce success once every file is done
                      for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        try {
                          const base64Data = await readFileAsBase64(file);
                          const res = await api.post('/admin/upload', {
                            filename: file.name,
                            base64Data
                          });
                          uploadedUrls.push(res.data.data.url);
                        } catch (err: any) {
                          failedNames.push(file.name);
                        }
                      }

                      if (uploadedUrls.length > 0) {
                        setImages(prev => [...prev, ...uploadedUrls]);
                      }

                      setIsUploadingImages(false);
                      // Reset the input so selecting the same file again re-triggers onChange
                      e.target.value = '';

                      if (failedNames.length > 0) {
                        alert(`Failed to upload: ${failedNames.join(', ')}${uploadedUrls.length ? `\n${uploadedUrls.length} image(s) uploaded successfully.` : ''}`);
                      } else {
                        alert(`${uploadedUrls.length} image(s) uploaded successfully!`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Shipping Price Override (₹)</label>
              <input
                type="number"
                placeholder="Leave blank to use default settings"
                value={shippingPriceOverride}
                onChange={(e) => setShippingPriceOverride(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Shipping Time Override</label>
              <input
                type="text"
                placeholder="e.g. Ships in 24 hours"
                value={shippingTimeOverride}
                onChange={(e) => setShippingTimeOverride(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Catalog Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Additional Description Box 1 (Highlights / Details)</label>
              <textarea
                rows={2}
                value={descriptionBox1}
                onChange={(e) => setDescriptionBox1(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="Additional details, features or premium aspects..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Additional Description Box 2 (Specifications / Care)</label>
              <textarea
                rows={2}
                value={descriptionBox2}
                onChange={(e) => setDescriptionBox2(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="Metal purity, weight, gemstone properties or jewelry care tips..."
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Online Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              >
                <option value="ENABLED">ENABLED</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Campaign Promotion Tags</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {['Trending', 'New Arrival', 'Best Seller', 'Featured Product'].map((tag) => (
                  <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      className="rounded border-gold/20 accent-gold"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded"
          >
            Save Fine Piece
          </button>
        </form>
      )}

      {/* Inventory table */}
      <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 font-light text-xs">Compiling inventory data...</div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/10 uppercase font-bold text-gray-400 bg-luxury-sand/15">
                  <th className="px-6 py-4">Jewelry Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Retail Price</th>
                  <th className="px-6 py-4 text-center">Stock Count</th>
                  <th className="px-6 py-4 text-center">Tag Badges</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-luxury-sand/5 font-medium text-luxury-charcoal">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100&auto=format&fit=crop'}
                        alt="thumb"
                        className="w-10 h-10 object-cover bg-luxury-sand rounded"
                      />
                      <span className="font-semibold block truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="px-6 py-4">{p.category?.name || 'Accessories'}</td>
                    <td className="px-6 py-4 font-outfit font-bold">₹{p.discountPrice || p.price}</td>
                    <td className="px-6 py-4 text-center font-bold">{p.stock}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                        {p.tags.map((t: string) => (
                          <span key={t} className="bg-gold/10 text-gold text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(p)}
                        className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full ${
                          p.status === 'ENABLED' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 border border-gold/20 text-gold hover:bg-gold hover:text-white rounded transition-all inline-flex"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all inline-flex"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 font-light text-sm">
            No products introduced yet. Click above to add some gold.
          </div>
        )}
      </div>
      
    </div>
  );
}