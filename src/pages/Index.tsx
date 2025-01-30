import { useState } from "react";
import { OrgSelector } from "@/components/OrgSelector";
import { MetadataFilter } from "@/components/MetadataFilter";
import { DiffViewer } from "@/components/DiffViewer";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [sourceOrg, setSourceOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [targetOrg, setTargetOrg] = useState<{ url: string; instanceUrl: string } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [differences, setDifferences] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const handleTypeSelect = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
      // Simulate fetching differences
      setDifferences([
        {
          type,
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
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false);
      toast({
        title: "Deployment Successful",
        description: "All selected items have been deployed to the target org.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-center text-secondary mb-8">
          Salesforce Metadata Deployment
        </h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <OrgSelector type="source" onConnect={setSourceOrg} />
          <OrgSelector type="target" onConnect={setTargetOrg} />
        </div>

        {sourceOrg && targetOrg && (
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
        )}
      </div>
    </div>
  );
};

export default Index;