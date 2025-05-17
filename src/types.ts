export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  templateUrl: string;
  tags: string[];
}

export interface ElementorTemplate {
  version: string;
  title?: string;
  type: string;
  content?: any[];
  elements?: any[];
}

export interface TransformedTemplate {
  version: string;
  title: string;
  type: string;
  elements: any[];
}

export interface FilterState {
  selectedTags: string[];
}