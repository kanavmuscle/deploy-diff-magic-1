import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OrgSelectorProps {
  type: "source" | "target";
  onConnect: (credentials: { url: string; instanceUrl: string }) => void;
}

export const OrgSelector = ({ type, onConnect }: OrgSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Initialize OAuth flow
      const clientId = "YOUR_SALESFORCE_CLIENT_ID"; // This should come from environment variables
      const redirectUri = encodeURIComponent(window.location.origin + "/oauth/callback");
      const loginUrl = type === "source" 
        ? "https://login.salesforce.com/services/oauth2/authorize"
        : "https://test.salesforce.com/services/oauth2/authorize";
      
      const url = `${loginUrl}?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=api%20refresh_token`;
      
      // Open Salesforce login window
      window.location.href = url;
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-sm animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-secondary">
        {type === "source" ? "Source Org" : "Target Org"}
      </h3>
      <div className="space-y-4">
        <p className="text-sm text-secondary/80">
          Connect to your {type === "source" ? "source" : "target"} Salesforce organization
        </p>
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
        >
          {isLoading ? "Connecting..." : `Login to ${type === "source" ? "Source" : "Target"} Org`}
        </Button>
      </div>
    </Card>
  );
};