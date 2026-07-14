import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import api from '@/utils/api';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Dialog / Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [redirectUrl, setRedirectUrl] = useState('/shop');
  const [status, setStatus] = useState<'ENABLED' | 'DISABLED'>('ENABLED');

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      // Admin-only endpoint: returns banners of every status (not just ENABLED)
      const res = await api.get('/admin/banners');
      setBanners(res.data.data);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEditClick = (b: any) => {
    setEditId(b._id);
    setImage(b.image);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setCtaText(b.ctaText || 'Shop Now');
    setRedirectUrl(b.redirectUrl || '/shop');
    setStatus(b.status);
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditId(null);
    setImage('');
    setTitle('');
    setSubtitle('');
    setCtaText('Shop Now');
    setRedirectUrl('/shop');
    setStatus('ENABLED');
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readFileAsBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    setIsUploadingImage(true);
    try {
      const base64Data = await readFileAsBase64(file);
      const res = await api.post('/admin/upload', {
        filename: file.name,
        base64Data
      });
      setImage(res.data.data.url);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Please upload or paste a banner image first');
      return;
    }
    const payload = { image, title, subtitle, ctaText, redirectUrl, status };

    try {
      if (editId) {
        await api.put(`/banners/${editId}`, payload);
        alert('Banner updated successfully');
      } else {
        await api.post('/banners', payload);
        alert('Banner created successfully');
      }
      setIsEditing(false);
      fetchBanners();
    } catch (err: any) {
      alert(err.error || 'Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {}
  };

  const handleStatusToggle = async (b: any) => {
    const nextStatus = b.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await api.put(`/banners/${b._id}`, { status: nextStatus });
      fetchBanners();
    } catch (err) {}
  };

  return (
    <div className="space-y-8">

      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Hero Campaigns</h1>
          <p className="text-xs text-gray-400 font-light mt-0.5">Manage the homepage hero banner slider</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Editor Drawer / modal */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white border border-gold/15 p-6 rounded-lg space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3 flex justify-between items-center">
            <span>{editId ? 'Modify Banner' : 'Introduce New Banner'}</span>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-600"><X size={16} /></button>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Banner Image</label>

              {image && (
                <div className="relative w-full max-w-md aspect-video border border-gold/10 rounded overflow-hidden mb-3">
                  <img src={image} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Paste image URL here or browse to upload..."
                  className="flex-1 bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-[11px]"
                />
                <label className={`px-4 py-2 border border-gold/20 hover:border-gold text-gold hover:bg-gold/5 rounded font-outfit font-bold uppercase tracking-wider cursor-pointer text-[10px] inline-flex items-center justify-center shrink-0 ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isUploadingImage ? 'Uploading...' : 'Browse'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 font-light mt-1.5">Recommended: a wide landscape image (e.g. 1920x1080) for best results on the hero slider.</p>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="Celestial Harmonies"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">CTA Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="Shop Rings"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="Discover diamond constellation bands that reflect stellar formations."
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1.5 text-gray-500">Redirect URL (on CTA click)</label>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                placeholder="/shop?category=rings"
                required
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
              <p className="text-[10px] text-gray-400 font-light mt-1.5">Only ENABLED banners appear in the homepage slider.</p>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded"
          >
            Save Banner
          </button>
        </form>
      )}

      {/* Banner list */}
      <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 font-light text-xs">Compiling campaign data...</div>
        ) : banners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/10 uppercase font-bold text-gray-400 bg-luxury-sand/15">
                  <th className="px-6 py-4">Banner</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Redirect URL</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {banners.map((b) => (
                  <tr key={b._id} className="hover:bg-luxury-sand/5 font-medium text-luxury-charcoal">
                    <td className="px-6 py-4">
                      <img
                        src={b.image}
                        alt="thumb"
                        className="w-20 h-12 object-cover bg-luxury-sand rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block truncate max-w-xs">{b.title}</span>
                      {b.subtitle && <span className="text-gray-400 font-light block truncate max-w-xs">{b.subtitle}</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-light truncate max-w-[160px]">{b.redirectUrl}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(b)}
                        className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full ${
                          b.status === 'ENABLED' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                        }`}
                      >
                        {b.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1.5 border border-gold/20 text-gold hover:bg-gold hover:text-white rounded transition-all inline-flex"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
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
            No campaigns introduced yet. Click above to add your first hero banner.
          </div>
        )}
      </div>

    </div>
  );
}