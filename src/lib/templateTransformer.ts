import { ElementorTemplate, TransformedTemplate } from '../types';

function validateTemplate(template: any): ElementorTemplate {
  console.log('Validating template:', template);

  if (!template) {
    throw new Error('Template is empty or undefined');
  }

  if (typeof template !== 'object') {
    throw new Error('Template must be an object');
  }

  // Extract elements from either content or root level
  const elements = template.content?.elements || template.elements;
  
  if (!elements || !Array.isArray(elements)) {
    throw new Error('Template must contain elements array either at root level or in content');
  }

  // Validate elements structure
  elements.forEach((element, index) => {
    if (!element.elType) {
      throw new Error(`Element at index ${index} missing required field 'elType'`);
    }
    if (!element.settings || typeof element.settings !== 'object') {
      throw new Error(`Element at index ${index} missing or invalid 'settings' object`);
    }
  });

  return {
    version: template.version || "0.4",
    type: template.type || "elementor",
    title: template.title,
    content: {
      elements: elements
    }
  };
}

export function transformTemplate(template: ElementorTemplate): TransformedTemplate {
  console.log('Starting template transformation');

  // Extract elements, ensuring we get the proper structure
  const elements = template.content?.elements || template.elements;
  
  if (!elements || !Array.isArray(elements)) {
    throw new Error('Template must contain valid elements array');
  }

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
    // First ensure we have a proper object
    const templateObj = typeof template === 'object' ? template : JSON.parse(template);

    // Extract elements, ensuring we get the proper structure
    const elements = templateObj.content?.elements || templateObj.elements;
    
    if (!elements || !Array.isArray(elements)) {
      throw new Error('Template must contain valid elements array');
    }

    // Create the final template with the exact structure Elementor expects
    const finalTemplate = {
      version: "0.4",
      type: "elementor",
      title: templateObj.title || "Untitled Template",
      siteurl: window.location.origin + "/wp-json/",
      elements: elements
    };

    // Convert to string for clipboard
    const finalString = JSON.stringify(finalTemplate);
    console.log('Final template structure:', finalTemplate);
    console.log('Elements count:', elements.length);
    console.log('Final length:', finalString.length);

    await navigator.clipboard.writeText(finalString);
  } catch (error) {
    console.error('Template processing error:', error);
    console.error('Template data:', template);
    throw new Error('Failed to process template: Invalid template format');
  }
}

export async function copyTemplateToClipboard(templateUrl: string, title: string, jsonContent?: any): Promise<void> {
  console.log('Starting template copy process', { templateUrl, title, jsonContent });

  try {
    // If we have JSON content, use it directly
    if (jsonContent) {
      await sanitizeAndCopyTemplate(jsonContent);
      console.log('Template copied from JSON content successfully');
      return;
    }

    // Otherwise, fetch from URL
    console.log('Fetching template from:', templateUrl);
    const response = await fetch(templateUrl);
    
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    // Get response text and clean it
    let text = await response.text();
    console.log('Raw template text length:', text.length);
    
    // Clean the text by removing any content after the last valid JSON character
    text = text.replace(/}\s*[^{}\[\]\s][\s\S]*$/, '}')
               .replace(/]\s*[^{}\[\]\s][\s\S]*$/, ']')
               .trim();
    
    let templateData;
    try {
      templateData = JSON.parse(text);
      console.log('Successfully parsed template data');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed text content:', text);
      throw new Error('Template is not valid JSON');
    }

    // Extract elements from either content or root level
    const elements = templateData.content?.elements || templateData.elements;
    
    if (!elements || !Array.isArray(elements)) {
      throw new Error('Template must contain elements array either at root level or in content');
    }

    // Create properly structured template
    const validTemplate = {
      version: templateData.version || "0.4",
      type: "elementor",
      title: title || templateData.title || "Untitled Template",
      content: {
        elements: elements
      }
    };

    // Transform and copy
    const transformed = transformTemplate(validTemplate);
    await sanitizeAndCopyTemplate(transformed);
    console.log('Template copied to clipboard successfully');
  } catch (error) {
    console.error('Template processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process template');
  }
}