export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  templateUrl: string;
  tags: string[];
}

export interface ElementorTemplate {
  title?: string;
  content?: {
    elements: TemplateElement[];
  };
  elements?: TemplateElement[];
}

export interface TemplateElement {
  id: string;
  elType?: string;
  settings?: Record<string, unknown>;
  elements?: TemplateElement[];
}

export interface TransformedTemplate {
  version: string;
  title: string;
  type: string;
  elements: TemplateElement[];
}

export interface FilterState {
  selectedTags: string[];
}