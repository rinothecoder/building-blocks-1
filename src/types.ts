export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  tags: string[];
  code: string;
}

export interface FilterState {
  selectedTags: string[];
}