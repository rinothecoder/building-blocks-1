export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  templateUrl: string;
  jsonContent?: any;
  tags: string[];
}

export interface ElementorTemplate {
  version: string;
  title?: string;
  type: string;
  content?: {
    elements: any[];
    page_settings?: Record<string, any>;
  };
  elements?: any[];
}

export interface TransformedTemplate {
  version: string;
  title: string;
  type: string;
  siteurl: string;
  elements: any[];
}

export interface FilterState {
  selectedTags: string[];
}