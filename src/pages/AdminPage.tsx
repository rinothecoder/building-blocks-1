import React, { useState, useEffect } from 'react';
import { Upload, Tag, Loader2, ArrowLeft, Settings, FileUp, Save, KeyRound, Grid, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Tag {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  thumbnail_url: string;
  created_at: string;
  tags: { name: string }[];
  status: 'active' | 'inactive';
}

type TabType = 'upload' | 'settings' | 'templates';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [template, setTemplate] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const templatesPerPage = 10;

  // Profile settings state
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTags();
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'templates') {
      loadUserTemplates(currentPage);
    }
  }, [activeTab, currentPage]);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setEmail(user.email);
    }
  };

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

  const loadUserTemplates = async (page: number) => {
    setLoadingTemplates(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const from = (page - 1) * templatesPerPage;
      const to = from + templatesPerPage - 1;

      // Get total count
      const { count } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      setTotalPages(Math.ceil((count || 0) / templatesPerPage));

      // Get templates with tags
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          template_tags (
            tags (
              name
            )
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setTemplates(data.map(template => ({
        ...template,
        tags: template.template_tags.map((tt: any) => tt.tags),
        status: 'active'
      })));
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const validateJsonContent = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        toast.error('JSON must contain an elements array');
        return false;
      }
      return true;
    } catch (error) {
      toast.error('Invalid JSON format');
      return false;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      loadUserTemplates(currentPage);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !thumbnail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (jsonContent && !validateJsonContent(jsonContent)) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting upload process...');
      
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

      let templateUrl = null;
      let parsedJsonContent = null;

      // Handle template file or JSON content
      if (template) {
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
        templateUrl = supabase.storage
          .from('templates')
          .getPublicUrl(templatePath).data.publicUrl;
      }

      if (jsonContent) {
        parsedJsonContent = JSON.parse(jsonContent);
      }

      // Get public URLs
      const thumbnailUrl = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailPath).data.publicUrl;

      console.log('Creating template record...');
      // Create template record
      const { data: templateRecord, error: templateInsertError } = await supabase
        .from('templates')
        .insert({
          name,
          thumbnail_url: thumbnailUrl,
          template_url: templateUrl,
          json_content: parsedJsonContent,
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
      setJsonContent('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate passwords match if updating password
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        if (newPassword.length < 8) {
          toast.error('Password must be at least 8 characters long');
          return;
        }
        if (!currentPassword) {
          toast.error('Current password is required to update password');
          return;
        }
      }

      // Verify current password if updating either email or password
      if (currentPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

        if (signInError) {
          toast.error('Current password is incorrect');
          return;
        }
      }

      // Update email if changed
      if (email !== (await supabase.auth.getUser()).data.user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });

        if (emailError) throw emailError;
        toast.success('Email updated successfully');
      }

      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;
        toast.success('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      }

      setCurrentPassword('');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
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

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto pt-6 px-4">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center justify-center flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Grid className="h-4 w-4 mr-2" />
            My Templates
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center justify-center flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <FileUp className="h-4 w-4 mr-2" />
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'templates' ? (
          <div className="max-w-7xl mx-auto px-4">
            {loadingTemplates ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Grid className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">Get started by uploading your first template.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Template
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-medium text-white mb-2">{template.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {template.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(template.thumbnail_url, '_blank')}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/admin/templates/${template.id}`}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            {activeTab === 'upload' ? (
              <>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Upload Template</h1>
                <form onSubmit={handleUploadSubmit} className="space-y-6">
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
                    <label htmlFor="jsonContent" className="block text-sm font-medium text-gray-700 mb-1">
                      Paste Elementor JSON here
                    </label>
                    <textarea
                      id="jsonContent"
                      value={jsonContent}
                      onChange={(e) => setJsonContent(e.target.value)}
                      className="w-full h-32 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste your Elementor JSON content here..."
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Template File (.json)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="template"
                        type="file"
                        accept=".json"
                        onChange={(e) => setTemplate(e.target.files?.[0] || null)}
                        className="w-full"
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
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Profile Settings</h1>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}