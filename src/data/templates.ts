import { Template } from '../types';

export const templates: Template[] = [
  {
    id: '1',
    title: 'Hero Section with Video Background',
    imageUrl: 'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['header', 'hero', 'video'],
    code: '<div class="elementor-section">Hero Section with Video Background Code</div>'
  },
  {
    id: '2',
    title: 'Services Grid with Icons',
    imageUrl: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['services', 'grid', 'icons'],
    code: '<div class="elementor-section">Services Grid with Icons Code</div>'
  },
  {
    id: '3',
    title: 'Testimonial Carousel',
    imageUrl: 'https://images.pexels.com/photos/8566474/pexels-photo-8566474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['testimonials', 'carousel', 'slider'],
    code: '<div class="elementor-section">Testimonial Carousel Code</div>'
  },
  {
    id: '4',
    title: 'Pricing Table with Toggle',
    imageUrl: 'https://images.pexels.com/photos/8566475/pexels-photo-8566475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['pricing', 'table', 'toggle'],
    code: '<div class="elementor-section">Pricing Table with Toggle Code</div>'
  },
  {
    id: '5',
    title: 'Contact Form with Map',
    imageUrl: 'https://images.pexels.com/photos/8566476/pexels-photo-8566476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['contact', 'form', 'map'],
    code: '<div class="elementor-section">Contact Form with Map Code</div>'
  },
  {
    id: '6',
    title: 'Team Members Grid',
    imageUrl: 'https://images.pexels.com/photos/8566477/pexels-photo-8566477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['team', 'grid', 'profiles'],
    code: '<div class="elementor-section">Team Members Grid Code</div>'
  },
  {
    id: '7',
    title: 'Portfolio Masonry Gallery',
    imageUrl: 'https://images.pexels.com/photos/8566478/pexels-photo-8566478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['portfolio', 'gallery', 'masonry'],
    code: '<div class="elementor-section">Portfolio Masonry Gallery Code</div>'
  },
  {
    id: '8',
    title: 'Call to Action with Background Parallax',
    imageUrl: 'https://images.pexels.com/photos/8566479/pexels-photo-8566479.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['cta', 'parallax', 'button'],
    code: '<div class="elementor-section">Call to Action with Background Parallax Code</div>'
  },
  {
    id: '9',
    title: 'Blog Post Grid with Filters',
    imageUrl: 'https://images.pexels.com/photos/8566480/pexels-photo-8566480.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['blog', 'grid', 'filter'],
    code: '<div class="elementor-section">Blog Post Grid with Filters Code</div>'
  },
  {
    id: '10',
    title: 'FAQ Accordion',
    imageUrl: 'https://images.pexels.com/photos/8566481/pexels-photo-8566481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['faq', 'accordion', 'toggle'],
    code: '<div class="elementor-section">FAQ Accordion Code</div>'
  },
  {
    id: '11',
    title: 'Statistics Counter Section',
    imageUrl: 'https://images.pexels.com/photos/8566482/pexels-photo-8566482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['statistics', 'counter', 'numbers'],
    code: '<div class="elementor-section">Statistics Counter Section Code</div>'
  },
  {
    id: '12',
    title: 'Footer with Newsletter',
    imageUrl: 'https://images.pexels.com/photos/8566483/pexels-photo-8566483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    tags: ['footer', 'newsletter', 'subscription'],
    code: '<div class="elementor-section">Footer with Newsletter Code</div>'
  }
];

// Extract all unique tags from templates
export const getAllTags = (): string[] => {
  const allTags = templates.flatMap(template => template.tags);
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.sort();
};

// Get templates filtered by selected tags
export const getFilteredTemplates = (selectedTags: string[]): Template[] => {
  if (selectedTags.length === 0) {
    return templates;
  }
  
  return templates.filter(template => 
    selectedTags.some(tag => template.tags.includes(tag))
  );
};