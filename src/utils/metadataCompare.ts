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

const getItemName = (item: any, type: string): string => {
  switch (type) {
    case 'CustomField':
      return item.DeveloperName || item.FullName || '';
    case 'CustomObject':
      return item.DeveloperName || item.FullName || '';
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
      return JSON.stringify(item || {}, null, 2);
  }
};

export const compareMetadata = (sourceItems: any[], targetItems: any[], type: string): CompareResult => {
  console.log(`Comparing ${sourceItems.length} source items with ${targetItems.length} target items for type ${type}`);
  
  const sourceMap = new Map();
  const targetMap = new Map();

  // Create maps for faster lookup
  sourceItems.forEach(item => {
    const name = getItemName(item, type);
    if (name) {
      sourceMap.set(name, item);
      console.log(`Source item: ${name}`);
    }
  });

  targetItems.forEach(item => {
    const name = getItemName(item, type);
    if (name) {
      targetMap.set(name, item);
      console.log(`Target item: ${name}`);
    }
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
      console.log(`New item found: ${name}`);
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
        console.log(`Changed item found: ${name}`);
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
      console.log(`Deleted item found: ${name}`);
      result.deleted.push({
        id: targetItem.Id,
        name,
        type,
        metadata: targetItem
      });
    }
  });

  console.log('Comparison results:', {
    noChangeCount: result.noChange.length,
    newCount: result.new.length,
    deletedCount: result.deleted.length,
    changedCount: result.changed.length
  });

  return result;
};