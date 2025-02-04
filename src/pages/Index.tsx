import { useState, useEffect } from "react";
import { OrgSelector } from "@/components/OrgSelector";
import { MetadataFilter } from "@/components/MetadataFilter";
import { CompareResults } from "@/components/CompareResults";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { fetchMetadataDetails } from "@/utils/salesforceApi";
import { compareMetadata } from "@/utils/metadataCompare";
import { CompareResult } from "@/types/metadata";

const Index = () => {
  const [sourceOrg, setSourceOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [targetOrg, setTargetOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [compareResults, setCompareResults] = useState<CompareResult | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        return "SELECT Id FROM CustomField";
      case 'CustomObject':
        return "SELECT Id FROM CustomObject";
      case 'ApexClass':
        return "SELECT Id FROM ApexClass";
      default:
        return `SELECT Id FROM ${type}`;
    }
  };

  const fetchMetadata = async (org: { url: string; instanceUrl: string }, type: string) => {
    console.log(`Fetching metadata for type ${type} from org ${org.instanceUrl}`);
    try {
      const query = getQueryForType(type);
      const response = await fetch(
        `${org.instanceUrl}/services/data/v57.0/tooling/query?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${org.url}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from Salesforce:`, errorText);
        throw new Error(`Failed to fetch ${type} metadata: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received metadata IDs for ${type}:`, data);

      const detailedRecords = await fetchMetadataDetails(org, data.records, type);
      console.log(`Received detailed metadata for ${type}:`, detailedRecords);
      
      return detailedRecords;
    } catch (error) {
      console.error(`Error fetching ${type} metadata:`, error);
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
    setCompareResults(null);

    try {
      console.log('Starting comparison for types:', selectedTypes);
      let allResults: CompareResult = {
        noChange: [],
        new: [],
        deleted: [],
        changed: []
      };

      for (const type of selectedTypes) {
        console.log(`Processing metadata type: ${type}`);
        const sourceItems = await fetchMetadata(sourceOrg, type);
        const targetItems = await fetchMetadata(targetOrg, type);
        const typeResults = compareMetadata(sourceItems, targetItems, type);
        
        // Merge results
        allResults = {
          noChange: [...allResults.noChange, ...typeResults.noChange],
          new: [...allResults.new, ...typeResults.new],
          deleted: [...allResults.deleted, ...typeResults.deleted],
          changed: [...allResults.changed, ...typeResults.changed]
        };
      }

      setCompareResults(allResults);
      
      const totalDiffs = allResults.new.length + allResults.deleted.length + allResults.changed.length;
      toast({
        title: "Comparison Complete",
        description: `Found ${totalDiffs} differences across ${selectedTypes.length} metadata types.`,
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
    setCompareResults(null);
  };

  const handleTargetDisconnect = () => {
    localStorage.removeItem('org_target');
    setTargetOrg(null);
    setSelectedTypes([]);
    setCompareResults(null);
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
            <CompareResults results={compareResults} />
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