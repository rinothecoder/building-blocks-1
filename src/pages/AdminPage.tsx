import React, { useState, useEffect } from 'react';
import { Upload, Tag, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Tag {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [template, setTemplate] = useState<File | null>(null);
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      setError(null);
      console.log('Fetching tags from Supabase...');

      const { data, error, status } = await supabase
        .from('tags')
        .select('*');

      console.log('Supabase response status:', status);
      
      if (error) {
        console.error('Supabase error:', error);
        setError(`${error.message} (Code: ${error.code})`);
        toast.error('Failed to load tags');
        return;
      }

      console.log('Tags received:', data);
      setTags(data || []);
    } catch (err) {
      console.error('Error in loadTags:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tags');
      toast.error('Failed to load tags');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !thumbnail || !template) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!template.name.endsWith('.json')) {
      toast.error('Template file must be a .json file');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting file upload process...');
      
      // Upload thumbnail
      const thumbnailPath = `thumbnails/${Date.now()}-${thumbnail.name}`;
      console.log('Uploading thumbnail to:', thumbnailPath);
      const { error: thumbnailError, data: thumbnailData } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnail);
      
      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        throw thumbnailError;
      }
      console.log('Thumbnail uploaded successfully:', thumbnailData);

      // Upload template
      const templatePath = `templates/${Date.now()}-${template.name}`;
      console.log('Uploading template to:', templatePath);
      const { error: templateError, data: templateData } = await supabase.storage
        .from('templates')
        .upload(templatePath, template);
      
      if (templateError) {
        console.error('Template upload error:', templateError);
        throw templateError;
      }
      console.log('Template uploaded successfully:', templateData);

      // Get public URLs
      const thumbnailUrl = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailPath).data.publicUrl;
      const templateUrl = supabase.storage
        .from('templates')
        .getPublicUrl(templatePath).data.publicUrl;

      console.log('Creating template record...');
      // Create template record
      const { data: templateRecord, error: templateInsertError } = await supabase
        .from('templates')
        .insert({
          name,
          thumbnail_url: thumbnailUrl,
          template_url: templateUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (templateInsertError) {
        console.error('Template record creation error:', templateInsertError);
        throw templateInsertError;
      }
      console.log('Template record created:', templateRecord);

      // Only create template_tags if tags are selected
      if (selectedTags.length > 0) {
        console.log('Creating template tags...');
        const templateTags = selectedTags.map(tagId => ({
          template_id: templateRecord.id,
          tag_id: tagId
        }));

        const { error: tagLinkError } = await supabase
          .from('template_tags')
          .insert(templateTags);
        
        if (tagLinkError) {
          console.error('Template tags creation error:', tagLinkError);
          throw tagLinkError;
        }
        console.log('Template tags created successfully');
      }

      toast.success('Template uploaded successfully');
      setName('');
      setSelectedTags([]);
      setThumbnail(null);
      setTemplate(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Back to Templates</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/logs"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                View Logs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Upload Template</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                id="templateName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Tags (Optional)
              </label>
              {error ? (
                <div className="text-red-600 text-sm mb-2">
                  Error loading tags: {error}
                </div>
              ) : loadingTags ? (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading tags...
                </div>
              ) : tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div 
                      key={tag.id} 
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags available</p>
              )}
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full"
                  required
                />
                {thumbnail && (
                  <Tag className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Template File * (.json)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="template"
                  type="file"
                  accept=".json"
                  onChange={(e) => setTemplate(e.target.files?.[0] || null)}
                  className="w-full"
                  required
                />
                {template && (
                  <Tag className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Template
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}