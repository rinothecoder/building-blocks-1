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
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }

  const templateData = await response.json();
  if (!templateData || typeof templateData !== 'object') {
    throw new Error('Invalid template data structure');
  }

  const transformed = transformTemplate({
    ...templateData,
    title
  });

  await navigator.clipboard.writeText(JSON.stringify(transformed, null, 2));
}