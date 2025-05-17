import { ElementorTemplate, TransformedTemplate } from '../types';

function validateTemplate(template: any): ElementorTemplate {
  console.log('Validating template:', template);

  if (!template) {
    throw new Error('Template is empty or undefined');
  }

  if (typeof template !== 'object') {
    throw new Error('Template must be an object');
  }

  // Check for required structure
  if (!template.content?.elements && !template.elements) {
    console.error('Invalid template structure:', template);
    throw new Error('Template must have either content.elements or elements array');
  }

  // Validate elements structure
  const elements = template.content?.elements || template.elements;
  if (!Array.isArray(elements)) {
    console.error('Invalid elements structure:', elements);
    throw new Error('Template elements must be an array');
  }

  return template as ElementorTemplate;
}

export function transformTemplate(template: ElementorTemplate): TransformedTemplate {
  console.log('Starting template transformation');

  // Extract elements from either content or direct elements property
  const elements = template.content?.elements || template.elements || [];
  console.log('Extracted elements:', elements);

  const transformed: TransformedTemplate = {
    version: "0.4",
    title: template.title || "Untitled Template",
    type: "elementor",
    elements: elements.map(element => ({
      ...element,
      elType: element.elType || "section",
      settings: element.settings || {},
      elements: element.elements || []
    }))
  };

  console.log('Transformed template:', transformed);
  return transformed;
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

    // Transform the template
    const transformed = transformTemplate({
      ...validatedTemplate,
      title: title || validatedTemplate.title
    });

    // Stringify with proper escaping and no formatting
    const templateString = JSON.stringify(transformed)
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\t/g, '')
      .replace(/\s+/g, ' ');

    console.log('Final template string:', templateString);

    await navigator.clipboard.writeText(templateString);
    console.log('Template copied to clipboard successfully');
  } catch (error) {
    console.error('Template processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process template');
  }
}