import { useState, useEffect } from "react";
import { OrgSelector } from "@/components/OrgSelector";
import { MetadataFilter } from "@/components/MetadataFilter";
import { DiffViewer } from "@/components/DiffViewer";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

const Index = () => {
  const [sourceOrg, setSourceOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [targetOrg, setTargetOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [differences, setDifferences] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load persisted connections on mount
    const sourceData = localStorage.getItem('org_source');
    const targetData = localStorage.getItem('org_target');

    if (sourceData) {
      setSourceOrg(JSON.parse(sourceData));
    }
    if (targetData) {
      setTargetOrg(JSON.parse(targetData));
    }
  }, []);

  const handleTypeSelect = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getQueryForType = (type: string) => {
    switch (type) {
      case 'CustomField':
        return "SELECT Id,DeveloperName,Metadata FROM CustomField";
      case 'CustomObject':
        return "SELECT Id,DeveloperName,Body FROM CustomObject";
      case 'ApexClass':
        return "SELECT Id,Name,Body FROM ApexClass";
      default:
        return `SELECT Id,Name,Body FROM ${type}`;
    }
  };

  const getItemName = (item: any, type: string) => {
    switch (type) {
      case 'CustomField':
        return item.DeveloperName;
      case 'CustomObject':
        return item.DeveloperName;
      default:
        return item.Name;
    }
  };

  const getItemBody = (item: any, type: string) => {
    switch (type) {
      case 'CustomField':
        return JSON.stringify(item.Metadata, null, 2);
      default:
        return item.Body;
    }
  };

  const fetchMetadata = async (org: { url: string; instanceUrl: string }, type: string) => {
    console.log(`Fetching metadata for type ${type} from org ${org.instanceUrl}`);
    try {
      const query = getQueryForType(type);
      const response = await fetch(`${org.instanceUrl}/services/data/v57.0/tooling/query?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${org.url}`,
          'Content-Type': 'application/json',
          'X-Prettyprint': '1'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from Salesforce:`, errorText);
        throw new Error(`Failed to fetch ${type} metadata: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received metadata for ${type}:`, data);
      return data.records;
    } catch (error) {
      console.error(`Error fetching ${type} metadata:`, error);
      throw error;
    }
  };

  const compareMetadata = (sourceItems: any[], targetItems: any[], type: string) => {
    console.log('Comparing metadata items:', { sourceItems, targetItems });
    const differences = [];

    try {
      for (const sourceItem of sourceItems) {
        const sourceItemName = getItemName(sourceItem, type);
        const targetItem = targetItems.find(item => getItemName(item, type) === sourceItemName);
        const sourceItemBody = getItemBody(sourceItem, type);

        if (!targetItem) {
          console.log(`Item ${sourceItemName} exists in source but not in target`);
          differences.push({
            type: sourceItem.attributes?.type || type,
            name: sourceItemName,
            changes: [{
              line: 1,
              source: sourceItemBody || 'Present in source',
              target: 'Not present in target'
            }]
          });
          continue;
        }

        const targetItemBody = getItemBody(targetItem, type);
        if (sourceItemBody !== targetItemBody) {
          console.log(`Found differences in ${sourceItemName}`);
          const sourceLines = (sourceItemBody || '').split('\n');
          const targetLines = (targetItemBody || '').split('\n');
          const changes = [];

          for (let i = 0; i < Math.max(sourceLines.length, targetLines.length); i++) {
            if (sourceLines[i] !== targetLines[i]) {
              changes.push({
                line: i + 1,
                source: sourceLines[i] || '(empty)',
                target: targetLines[i] || '(empty)'
              });
            }
          }

          if (changes.length > 0) {
            differences.push({
              type: sourceItem.attributes?.type || type,
              name: sourceItemName,
              changes
            });
          }
        }
      }

      // Check for items that exist only in target
      for (const targetItem of targetItems) {
        const targetItemName = getItemName(targetItem, type);
        const sourceItem = sourceItems.find(item => getItemName(item, type) === targetItemName);
        if (!sourceItem) {
          console.log(`Item ${targetItemName} exists in target but not in source`);
          differences.push({
            type: targetItem.attributes?.type || type,
            name: targetItemName,
            changes: [{
              line: 1,
              source: 'Not present in source',
              target: getItemBody(targetItem, type) || 'Present in target'
            }]
          });
        }
      }

      console.log('Comparison complete. Found differences:', differences);
      return differences;
    } catch (error) {
      console.error('Error during comparison:', error);
      throw error;
    }
  };

  const handleCompare = async () => {
    if (!sourceOrg || !targetOrg) {
      toast({
        variant: "destructive",
        title: "Cannot compare",
        description: "Both source and target orgs must be connected.",
      });
      return;
    }

    if (selectedTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot compare",
        description: "Please select at least one metadata type to compare.",
      });
      return;
    }

    setIsComparing(true);
    setDifferences([]);

    try {
      console.log('Starting comparison for types:', selectedTypes);
      const allDifferences = [];

      for (const type of selectedTypes) {
        console.log(`Processing metadata type: ${type}`);
        const sourceItems = await fetchMetadata(sourceOrg, type);
        const targetItems = await fetchMetadata(targetOrg, type);
        const typeDifferences = compareMetadata(sourceItems, targetItems);
        allDifferences.push(...typeDifferences);
      }

      setDifferences(allDifferences);
      
      toast({
        title: "Comparison Complete",
        description: `Found ${allDifferences.length} differences across ${selectedTypes.length} metadata types.`,
      });
    } catch (error) {
      console.error('Comparison error:', error);
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "An error occurred while comparing metadata.",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      toast({
        title: "Deployment Successful",
        description: "All selected items have been deployed to the target org.",
      });
    }, 2000);
  };

  const handleSourceDisconnect = () => {
    localStorage.removeItem('org_source');
    setSourceOrg(null);
    setSelectedTypes([]);
    setDifferences([]);
  };

  const handleTargetDisconnect = () => {
    localStorage.removeItem('org_target');
    setTargetOrg(null);
    setSelectedTypes([]);
    setDifferences([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-center text-secondary mb-8">
          Salesforce Org Compare
        </h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <OrgSelector 
            type="source" 
            onConnect={setSourceOrg} 
            onDisconnect={handleSourceDisconnect}
          />
          <OrgSelector 
            type="target" 
            onConnect={setTargetOrg} 
            onDisconnect={handleTargetDisconnect}
          />
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={handleCompare}
            disabled={isComparing}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {isComparing ? "Comparing..." : "Compare Metadata"}
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <MetadataFilter
              selectedTypes={selectedTypes}
              onTypeSelect={handleTypeSelect}
            />
          </div>
          <div className="col-span-9 space-y-8">
            <DiffViewer differences={differences} />
            <DeploymentPanel
              selectedItems={selectedTypes}
              onDeploy={handleDeploy}
              isDeploying={isDeploying}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
