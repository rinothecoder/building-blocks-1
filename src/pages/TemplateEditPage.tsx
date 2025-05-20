import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Tag {
  id: string;
  name: string;
}

interface TemplateData {
  id: string;
  name: string;
  thumbnail_url: string;
  template_url: string;
  tags: Tag[];
}

export default function TemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [template, setTemplate] = useState<File | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');
  const [currentTemplateUrl, setCurrentTemplateUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplateAndTags();
  }, [id]);

  const loadTemplateAndTags = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch template data
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select(`
          *,
          template_tags (
            tags (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (templateError) throw templateError;

      // Fetch all available tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Set template data
      setName(templateData.name);
      setCurrentThumbnailUrl(templateData.thumbnail_url);
      setCurrentTemplateUrl(templateData.template_url || '');
      
      // Set tags
      setAvailableTags(tagsData || []);
      setSelectedTags(templateData.template_tags.map((tt: any) => tt.tags.id));

    } catch (err) {
      console.error('Error loading template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      // Delete template tags first (foreign key constraint will handle this automatically)
      const { error: deleteTagsError } = await supabase
        .from('template_tags')
        .delete()
        .eq('template_id', id);

      if (deleteTagsError) throw deleteTagsError;

      // Delete the template record
      const { error: deleteTemplateError } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (deleteTemplateError) throw deleteTemplateError;

      // Extract file paths from URLs
      const thumbnailPath = currentThumbnailUrl.split('/').pop();
      const templatePath = currentTemplateUrl ? currentTemplateUrl.split('/').pop() : null;

      // Delete files from storage
      if (thumbnailPath) {
        const { error: thumbnailDeleteError } = await supabase.storage
          .from('thumbnails')
          .remove([thumbnailPath]);
          
        if (thumbnailDeleteError) {
          console.error('Error deleting thumbnail:', thumbnailDeleteError);
        }
      }

      if (templatePath) {
        const { error: templateDeleteError } = await supabase.storage
          .from('templates')
          .remove([templatePath]);
          
        if (templateDeleteError) {
          console.error('Error deleting template file:', templateDeleteError);
        }
      }

      toast.success('Template deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    let thumbnailUrl = currentThumbnailUrl;
    let templateUrl = currentTemplateUrl;

    // Upload new thumbnail if provided
    if (thumbnail) {
      const thumbnailPath = `thumbnails/${Date.now()}-${thumbnail.name}`;
      const { error: thumbnailError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnail);

      if (thumbnailError) throw thumbnailError;

      thumbnailUrl = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailPath).data.publicUrl;
    }

    // Upload and convert new template if provided
    if (template) {
      const fileText = await template.text();
      const rawJson = JSON.parse(fileText);

      const elements = rawJson.elements || rawJson.content;

      if (!Array.isArray(elements)) throw new Error("Invalid template structure: missing elements array.");

      const convertedTemplate = {
        version: '0.4',
        type: 'elementor',
        title: name,
        siteurl: window.location.origin + '/wp-json/',
        elements: elements,
      };

      const blob = new Blob([JSON.stringify(convertedTemplate)], { type: 'application/json' });
      const convertedFile = new File([blob], `converted-${Date.now()}-${template.name}`, { type: 'application/json' });

      const templatePath = `templates/${convertedFile.name}`;
      const { error: templateError } = await supabase.storage
        .from('templates')
        .upload(templatePath, convertedFile);

      if (templateError) throw templateError;

      templateUrl = supabase.storage
        .from('templates')
        .getPublicUrl(templatePath).data.publicUrl;
    }

    // Update template record
    const { error: updateError } = await supabase
      .from('templates')
      .update({
        name,
        thumbnail_url: thumbnailUrl,
        template_url: templateUrl
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Tag syncing (unchanged)
    const { data: existingTags, error: existingTagsError } = await supabase
      .from('template_tags')
      .select('tag_id')
      .eq('template_id', id);

    if (existingTagsError) throw existingTagsError;

    const existingTagIds = existingTags.map(tag => tag.tag_id);
    const tagsToRemove = existingTagIds.filter(tagId => !selectedTags.includes(tagId));
    const tagsToAdd = selectedTags.filter(tagId => !existingTagIds.includes(tagId));

    if (tagsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('template_tags')
        .delete()
        .eq('template_id', id)
        .in('tag_id', tagsToRemove);

      if (deleteError) throw deleteError;
    }

    if (tagsToAdd.length > 0) {
      const templateTags = tagsToAdd.map(tagId => ({
        template_id: id,
        tag_id: tagId
      }));

      const { error: tagLinkError } = await supabase
        .from('template_tags')
        .insert(templateTags);

      if (tagLinkError) throw tagLinkError;
    }

    toast.success('Template updated successfully');
    navigate('/');
  } catch (error) {
    console.error('Update error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update template');
  } finally {
    setIsSaving(false);
  }
};

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading template...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center text-red-700 hover:text-red-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Edit Template</h1>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Template
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
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
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Tag className="h-4 w-4 mr-1.5" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                New Thumbnail Image (Optional)
              </label>
              <div className="space-y-2">
                {currentThumbnailUrl && (
                  <img
                    src={currentThumbnailUrl}
                    alt="Current thumbnail"
                    className="h-32 w-auto rounded-lg border border-gray-200"
                  />
                )}
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                New Template File (Optional)
              </label>
              <input
                id="template"
                type="file"
                accept=".json"
                onChange={(e) => setTemplate(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving changes...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}