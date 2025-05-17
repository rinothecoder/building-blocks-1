export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  templateUrl: string;
  tags: string[];
}

export interface FilterState {
  selectedTags: string[];
}