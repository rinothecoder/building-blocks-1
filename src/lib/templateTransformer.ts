import { ElementorTemplate, TransformedTemplate } from '../types';

function validateTemplate(template: any): ElementorTemplate {
  console.log('Validating template:', template);

  if (!template) {
    throw new Error('Template is empty or undefined');
  }

  if (typeof template !== 'object') {
    throw new Error('Template must be an object');
  }

  // Check for required fields
  if (!template.version || !template.type) {
    console.error('Invalid template structure:', template);
    throw new Error('Template missing required fields (version, type)');
  }

  return template as ElementorTemplate;
}

export function transformTemplate(template: ElementorTemplate): TransformedTemplate {
  console.log('Starting template transformation');

  // Extract elements from content or direct elements property
  const elements = template.content?.elements || template.elements || [];
  console.log('Extracted elements:', elements);

  const transformed: TransformedTemplate = {
    version: template.version,
    title: template.title || "Untitled Template",
    type: "elementor",
    siteurl: window.location.origin + "/wp-json/",
    thumbnail: "",
    elements: elements
  };

  console.log('Transformed template:', transformed);
  return transformed;
}

export async function sanitizeAndCopyTemplate(template: any): Promise<void> {
  try {
    // First convert to string if it's an object
    const templateString = typeof template === 'string' 
      ? template 
      : JSON.stringify(template);

    console.log('Original length:', templateString.length);

    // Clean the string of any potential hidden characters
    const cleanString = templateString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\u00A0/g, ' ')  // Replace non-breaking spaces
      .replace(/\uFEFF/g, '')   // Remove byte order mark
      .trim();                  // Remove leading/trailing whitespace

    console.log('Cleaned length:', cleanString.length);

    // Parse back to object to ensure valid JSON
    const templateObj = JSON.parse(cleanString);

    // Convert back to string for clipboard
    const finalString = JSON.stringify(templateObj);
    console.log('Final length:', finalString.length);

    await navigator.clipboard.writeText(finalString);
  } catch (error) {
    console.error('Template processing error:', error);
    console.error('Template string:', template);
    throw new Error('Failed to process template');
  }
}

export async function copyTemplateToClipboard(templateUrl: string, title: string): Promise<void> {
  console.log('Starting template copy process', { templateUrl, title });

  try {
    // Fetch template data
    console.log('Fetching template from:', templateUrl);
    const response = await fetch(templateUrl);
    
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    // Get response text and try to parse
    const text = await response.text();
    console.log('Raw template text:', text);

    let templateData;
    try {
      templateData = JSON.parse(text.trim());
      console.log('Parsed template data:', templateData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON format in template file');
    }

    // Validate template structure
    const validatedTemplate = validateTemplate(templateData);

    // Transform and sanitize the template
    const transformed = transformTemplate({
      ...validatedTemplate,
      title: title || validatedTemplate.title
    });

    // Use the new sanitization function
    await sanitizeAndCopyTemplate(transformed);
    console.log('Template copied to clipboard successfully');
  } catch (error) {
    console.error('Template processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process template');
  }
}