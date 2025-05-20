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
  
  // Validate elements structure
  if (!Array.isArray(elements)) {
    throw new Error('Template elements must be an array');
  }

  // Validate each element has required Elementor fields
  elements.forEach((element, index) => {
    if (!element.elType) {
      throw new Error(`Element at index ${index} missing required field 'elType'`);
    }
    if (!element.settings || typeof element.settings !== 'object') {
      throw new Error(`Element at index ${index} missing or invalid 'settings' object`);
    }
  });

  // Create the transformed template with the exact structure Elementor expects
  const transformed: TransformedTemplate = {
    version: "0.4",
    title: template.title || "Untitled Template",
    type: "elementor",
    siteurl: window.location.origin + "/wp-json/",
    elements: elements
  };

  console.log('Transformed template:', transformed);
  return transformed;
}

export async function sanitizeAndCopyTemplate(template: any): Promise<void> {
  try {
    // Check if template is already an object
    const templateObj = typeof template === 'object' ? template : JSON.parse(template);

    // Create the final template with the exact structure Elementor expects
    const finalTemplate = {
      version: "0.4",
      type: "elementor",
      title: templateObj.title || "Untitled Template",
      siteurl: window.location.origin + "/wp-json/",
      elements: templateObj.elements || []
    };

    // Validate elements structure
    if (!Array.isArray(finalTemplate.elements)) {
      throw new Error('Template elements must be an array');
    }

    // Validate each element has required Elementor fields
    finalTemplate.elements.forEach((element, index) => {
      if (!element.elType) {
        throw new Error(`Element at index ${index} missing required field 'elType'`);
      }
      if (!element.settings || typeof element.settings !== 'object') {
        throw new Error(`Element at index ${index} missing or invalid 'settings' object`);
      }
    });

    // Convert to string for clipboard
    const finalString = JSON.stringify(finalTemplate);
    console.log('Final template structure:', finalTemplate);
    console.log('Final length:', finalString.length);

    await navigator.clipboard.writeText(finalString);
  } catch (error) {
    console.error('Template processing error:', error);
    console.error('Template data:', template);
    throw new Error('Failed to process template: Invalid template format');
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

    // Get response text
    const text = await response.text();
    console.log('Raw template text length:', text.length);
    
    let templateData;
    try {
      // First try to parse the raw text
      templateData = JSON.parse(text);
      console.log('Successfully parsed template data');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed text content:', text);
      
      // Try to clean the text and parse again
      const cleanedText = text
        .replace(/}\s*[^{}\[\]\s][\s\S]*$/, '}')
        .replace(/]\s*[^{}\[\]\s][\s\S]*$/, ']')
        .trim();
      
      try {
        templateData = JSON.parse(cleanedText);
        console.log('Successfully parsed cleaned template data');
      } catch (secondParseError) {
        console.error('Failed to parse even after cleaning:', secondParseError);
        throw new Error('Template is not valid JSON');
      }
    }

    // Validate template structure
    const validatedTemplate = validateTemplate(templateData);

    // Transform and sanitize the template
    const transformed = transformTemplate({
      ...validatedTemplate,
      title: title || validatedTemplate.title
    });

    // Copy to clipboard
    await sanitizeAndCopyTemplate(transformed);
    console.log('Template copied to clipboard successfully');
  } catch (error) {
    console.error('Template processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process template');
  }
}