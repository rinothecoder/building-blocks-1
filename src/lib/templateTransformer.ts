import { ElementorTemplate, TransformedTemplate } from '../types';

export function transformTemplate(template: ElementorTemplate): TransformedTemplate {
  // Extract elements from either content or direct elements property
  const elements = template.content?.elements || template.elements || [];

  return {
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
}

export async function copyTemplateToClipboard(templateUrl: string, title: string): Promise<void> {
  try {
    // Fetch template data
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    let templateData;
    try {
      const text = await response.text();
      templateData = JSON.parse(text.trim());
    } catch (parseError) {
      throw new Error('Invalid JSON format in template file');
    }

    if (!templateData || typeof templateData !== 'object') {
      throw new Error('Invalid template data structure');
    }

    // Transform the template
    const transformed = transformTemplate({
      ...templateData,
      title: title || templateData.title
    });

    // Stringify with proper escaping and no formatting
    const templateString = JSON.stringify(transformed)
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\t/g, '')
      .replace(/\s+/g, ' ');

    await navigator.clipboard.writeText(templateString);
  } catch (error) {
    console.error('Template processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process template');
  }
}