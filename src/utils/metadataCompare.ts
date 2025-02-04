import { MetadataItem, CompareResult, ChangedItem, MetadataDiff } from "@/types/metadata";

const computeDiff = (source: string, target: string): MetadataDiff[] => {
  const sourceLines = source.split('\n');
  const targetLines = target.split('\n');
  const differences: MetadataDiff[] = [];

  for (let i = 0; i < Math.max(sourceLines.length, targetLines.length); i++) {
    if (sourceLines[i] !== targetLines[i]) {
      differences.push({
        line: i + 1,
        source: sourceLines[i] || '(empty)',
        target: targetLines[i] || '(empty)'
      });
    }
  }

  return differences;
};

export const compareMetadata = (sourceItems: any[], targetItems: any[], type: string): CompareResult => {
  const sourceMap = new Map();
  const targetMap = new Map();

  // Create maps for faster lookup
  sourceItems.forEach(item => {
    const name = getItemName(item, type);
    sourceMap.set(name, item);
  });

  targetItems.forEach(item => {
    const name = getItemName(item, type);
    targetMap.set(name, item);
  });

  const result: CompareResult = {
    noChange: [],
    new: [],
    deleted: [],
    changed: []
  };

  // Check for new and changed items
  sourceMap.forEach((sourceItem, name) => {
    const targetItem = targetMap.get(name);
    
    if (!targetItem) {
      // Item exists only in source
      result.new.push({
        id: sourceItem.Id,
        name,
        type,
        metadata: sourceItem
      });
    } else {
      const sourceBody = getItemBody(sourceItem, type);
      const targetBody = getItemBody(targetItem, type);

      if (sourceBody === targetBody) {
        // No changes
        result.noChange.push({
          id: sourceItem.Id,
          name,
          type,
          metadata: sourceItem
        });
      } else {
        // Changed items
        result.changed.push({
          id: sourceItem.Id,
          name,
          type,
          sourceMetadata: sourceItem,
          targetMetadata: targetItem,
          differences: computeDiff(sourceBody, targetBody)
        });
      }
    }
  });

  // Check for deleted items
  targetMap.forEach((targetItem, name) => {
    if (!sourceMap.has(name)) {
      result.deleted.push({
        id: targetItem.Id,
        name,
        type,
        metadata: targetItem
      });
    }
  });

  return result;
};

const getItemName = (item: any, type: string): string => {
  switch (type) {
    case 'CustomField':
    case 'CustomObject':
      return item.DeveloperName || '';
    default:
      return item.Name || '';
  }
};

const getItemBody = (item: any, type: string): string => {
  switch (type) {
    case 'CustomField':
    case 'CustomObject':
      return JSON.stringify(item.Metadata || {}, null, 2);
    case 'ApexClass':
      return item.Body || '';
    default:
      return item.Body || '';
  }
};