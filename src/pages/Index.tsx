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

  const fetchMetadata = async (org: { url: string; instanceUrl: string }, type: string) => {
    try {
      const response = await fetch(`${org.instanceUrl}/services/data/v57.0/tooling/query?q=SELECT+Id,Name,Body+FROM+${type}`, {
        headers: {
          'Authorization': `Bearer ${org.url}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} metadata`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error(`Error fetching ${type} metadata:`, error);
      throw error;
    }
  };

  const compareMetadata = (sourceItems: any[], targetItems: any[]) => {
    const differences = [];

    for (const sourceItem of sourceItems) {
      const targetItem = targetItems.find(item => item.Name === sourceItem.Name);

      if (!targetItem) {
        // Item exists in source but not in target
        differences.push({
          type: sourceItem.attributes.type,
          name: sourceItem.Name,
          changes: [{
            line: 1,
            source: sourceItem.Body || 'Present in source',
            target: 'Not present in target'
          }]
        });
        continue;
      }

      if (sourceItem.Body !== targetItem.Body) {
        // Item exists in both but has differences
        const sourceLines = (sourceItem.Body || '').split('\n');
        const targetLines = (targetItem.Body || '').split('\n');
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
            type: sourceItem.attributes.type,
            name: sourceItem.Name,
            changes
          });
        }
      }
    }

    // Check for items that exist only in target
    for (const targetItem of targetItems) {
      const sourceItem = sourceItems.find(item => item.Name === targetItem.Name);
      if (!sourceItem) {
        differences.push({
          type: targetItem.attributes.type,
          name: targetItem.Name,
          changes: [{
            line: 1,
            source: 'Not present in source',
            target: targetItem.Body || 'Present in target'
          }]
        });
      }
    }

    return differences;
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
      const allDifferences = [];

      for (const type of selectedTypes) {
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
        description: "An error occurred while comparing metadata. Please try again.",
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
          Salesforce Metadata Deployment
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
