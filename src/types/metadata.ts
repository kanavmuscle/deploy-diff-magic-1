export interface MetadataItem {
  id: string;
  name: string;
  type: string;
  metadata: any;
}

export interface MetadataDiff {
  line: number;
  source: string;
  target: string;
}

export interface ChangedItem {
  id: string;
  name: string;
  type: string;
  sourceMetadata: any;
  targetMetadata: any;
  differences: MetadataDiff[];
}

export interface CompareResult {
  noChange: MetadataItem[];
  new: MetadataItem[];
  deleted: MetadataItem[];
  changed: ChangedItem[];
}