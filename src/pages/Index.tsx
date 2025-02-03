import { useState } from "react";
import { OrgSelector } from "@/components/OrgSelector";
import { MetadataFilter } from "@/components/MetadataFilter";
import { DiffViewer } from "@/components/DiffViewer";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

const METADATA_TYPES = ["CustomField", "CustomObject", "ApexClass"];

const Index = () => {
  const [sourceOrg, setSourceOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [targetOrg, setTargetOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [differences, setDifferences] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  const handleTypeSelect = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
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

    setIsComparing(true);
    // Simulate comparison for now
    setTimeout(() => {
      setDifferences([
        {
          type: "ApexClass",
          name: "SampleClass",
          changes: [
            {
              line: 1,
              source: "public class SampleClass {",
              target: "public class SampleClass implements Interface {",
            },
          ],
        },
      ]);
      setIsComparing(false);
      toast({
        title: "Comparison Complete",
        description: "Metadata differences have been loaded.",
      });
    }, 2000);
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
    setSourceOrg(null);
    setSelectedTypes([]);
    setDifferences([]);
  };

  const handleTargetDisconnect = () => {
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