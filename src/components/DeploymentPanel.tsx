import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface DeploymentPanelProps {
  selectedItems: string[];
  onDeploy: () => void;
  isDeploying: boolean;
}

export const DeploymentPanel = ({
  selectedItems,
  onDeploy,
  isDeploying,
}: DeploymentPanelProps) => {
  return (
    <Card className="p-4 backdrop-blur-sm bg-white/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-secondary">
            {selectedItems.length} items selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Ready for deployment
          </p>
        </div>
        <Button
          onClick={onDeploy}
          disabled={isDeploying || selectedItems.length === 0}
          className="bg-primary hover:bg-primary/90 transition-colors"
        >
          {isDeploying ? (
            "Deploying..."
          ) : (
            <>
              Deploy <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {selectedItems.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm p-2 rounded bg-muted animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span>{item}</span>
              {isDeploying ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-red-500 transition-colors" />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};