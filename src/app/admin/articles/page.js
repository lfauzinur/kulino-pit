'use client';
import { useState } from 'react';
import { 
  ChevronDown, Eye, Type, Image as ImageIcon, 
  Bold, Italic, List, Grid, Link as LinkIcon, Code,
  Trash2, ArrowDown, ArrowUp, Move, Plus, Calendar, Clock,
  Check, X
} from 'lucide-react';

export default function AdminArticlesPage() {
  const [title, setTitle] = useState('Making The World a Better Place');
  const [activeTab, setActiveTab] = useState('Content');
  const [publishedGlobally, setPublishedGlobally] = useState(true);
  const [publishedEnglish, setPublishedEnglish] = useState(true);
  
  const [metaForm, setMetaForm] = useState({ metaTitle: '', metaDescription: '', keywords: '' });
  const [seoForm, setSeoForm] = useState({ slug: '', canonical: '', ogImage: '' });

  const [blocks, setBlocks] = useState([
    { 
      id: 1, 
      type: 'text', 
      title: 'Making The World a Better Place', 
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis ipsum amet turpis nibh ipsum parturient donec. Ultrices porttitor nullam volutpat et in. Vitae quis tortor a odio tincidunt.' 
    },
    { 
      id: 2, 
      type: 'image', 
      caption: '' 
    }
  ]);

  const handleSave = () => {
    try {
      const newArticle = {
        id: 'custom-' + Date.now(),
        title: { id: title, en: title },
        excerpt: { 
          id: blocks.find(b => b.type === 'text')?.content || 'No excerpt available.', 
          en: blocks.find(b => b.type === 'text')?.content || 'No excerpt available.' 
        },
        date: new Date().toISOString().split('T')[0],
        category: { id: metaForm.keywords || 'Berita', en: metaForm.keywords || 'News' },
        image: '/images/bikes/roadbike.png' // Default placeholder image
      };
      
      const existing = JSON.parse(localStorage.getItem('customArticles') || '[]');
      localStorage.setItem('customArticles', JSON.stringify([newArticle, ...existing]));
      alert('Article published successfully! Check the main Articles page.');
    } catch (e) {
      console.error(e);
      alert('Failed to save article.');
    }
  };

  const updateBlock = (id, field, val) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 w-full sm:max-w-2xl px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          placeholder="Article Title..."
        />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => alert('Change language')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            English <ChevronDown size={16} />
          </button>
          <button type="button" onClick={() => alert('Preview mode')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Eye size={16} /> Preview
          </button>
          <div className="flex">
            <button type="button" onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-l-lg hover:bg-blue-700 shadow-sm">
              Save
            </button>
            <button type="button" onClick={() => alert('More options')} className="px-2 py-2 bg-blue-600 border-l border-blue-700 text-white rounded-r-lg hover:bg-blue-700 shadow-sm">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Editor Area */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-t-xl overflow-hidden p-1">
            {['Content', 'Meta', 'SEO'].map(tab => (
              <button 
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === tab ? 'bg-gray-50 text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 border-t-0 p-6 rounded-b-xl shadow-sm min-h-[600px]">
            {activeTab === 'Content' && (
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <div key={block.id} className="border border-gray-100 rounded-xl bg-gray-50/30 overflow-hidden group">
                    {/* Block Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
                      <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                        <ChevronDown size={16} />
                        {block.type === 'text' ? 'Text' : 'Image'}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded"><ArrowDown size={14} /></button>
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded"><ArrowUp size={14} /></button>
                        <button type="button" className="p-1.5 hover:bg-gray-100 rounded cursor-move"><Move size={14} /></button>
                      </div>
                    </div>

                    {/* Block Content */}
                    <div className="p-4 bg-white">
                      {block.type === 'text' && (
                        <div>
                          {/* Toolbar */}
                          <div className="flex items-center gap-1 mb-4 border border-gray-200 rounded-lg p-1 w-max">
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Type size={16} /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Bold size={16} /></button>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Italic size={16} /></button>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><List size={16} /></button>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Grid size={16} /></button>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><LinkIcon size={16} /></button>
                            <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Code size={16} /></button>
                          </div>
                          
                          <input 
                            type="text" 
                            value={block.title || ''} 
                            onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                            className="w-full font-bold text-xl text-gray-800 mb-3 focus:outline-none"
                            placeholder="Heading..."
                          />
                          <textarea 
                            className="w-full text-gray-600 focus:outline-none resize-none min-h-[100px]"
                            value={block.content || ''}
                            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                            placeholder="Start typing..."
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 w-24">Upload image*</span>
                            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center gap-2 text-blue-600 bg-blue-50/30 cursor-pointer hover:bg-blue-50">
                              <ImageIcon size={20} />
                              <span className="text-sm font-medium">Upload a file or drag and drop</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 w-24">Caption</span>
                            <input 
                              type="text" 
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                              value={block.caption || ''}
                              onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => alert('Add new block feature')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm mt-4">
                  <Plus size={16} /> Add block
                </button>
              </div>
            )}
            
            {activeTab === 'Meta' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                  <input 
                    type="text" 
                    value={metaForm.metaTitle}
                    onChange={(e) => setMetaForm({...metaForm, metaTitle: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder="Enter meta title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                  <textarea 
                    value={metaForm.metaDescription}
                    onChange={(e) => setMetaForm({...metaForm, metaDescription: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 h-24 resize-none"
                    placeholder="Enter meta description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Keywords</label>
                  <input 
                    type="text" 
                    value={metaForm.keywords}
                    onChange={(e) => setMetaForm({...metaForm, keywords: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder="e.g. blog, travel, updates"
                  />
                </div>
              </div>
            )}

            {activeTab === 'SEO' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                  <input 
                    type="text" 
                    value={seoForm.slug}
                    onChange={(e) => setSeoForm({...seoForm, slug: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder="e.g. making-the-world-a-better-place"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Canonical URL</label>
                  <input 
                    type="text" 
                    value={seoForm.canonical}
                    onChange={(e) => setSeoForm({...seoForm, canonical: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder="https://"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Author</label>
            <div className="relative">
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">DC</div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">David Clarke</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Post Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Post date</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" value="02/12/2019" className="w-full px-3 py-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm focus:outline-none" readOnly />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative w-28">
                <input type="text" value="16:00" className="w-full px-3 py-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm focus:outline-none" readOnly />
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
            <div className="w-full p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                Big Data <button type="button" onClick={() => alert('Remove tag')} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
              </span>
              <button type="button" onClick={() => alert('Add tag')} className="ml-auto p-1 text-gray-400 hover:text-blue-500">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tag</label>
            <div className="w-full p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                Big Data <button type="button" onClick={() => alert('Remove tag')} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
              </span>
              <button type="button" onClick={() => alert('Add tag')} className="ml-auto p-1 text-gray-400 hover:text-blue-500">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Published globally</span>
              <button 
                type="button"
                onClick={() => setPublishedGlobally(!publishedGlobally)}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${publishedGlobally ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${publishedGlobally ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Published in English</span>
              <button 
                type="button"
                onClick={() => setPublishedEnglish(!publishedEnglish)}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${publishedEnglish ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${publishedEnglish ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
