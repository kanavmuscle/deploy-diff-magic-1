import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle2, LogOut } from "lucide-react";

interface OrgSelectorProps {
  type: "source" | "target";
  onConnect: (credentials: { url: string; instanceUrl: string }) => void;
  onDisconnect: () => void;
}

export const OrgSelector = ({ type, onConnect, onDisconnect }: OrgSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [orgUrl, setOrgUrl] = useState<string>("");

  useEffect(() => {
    // Check for stored OAuth response specific to this org type
    const storedResponse = sessionStorage.getItem(`oauth_response_${type}`);
    if (storedResponse) {
      const { accessToken, instanceUrl } = JSON.parse(storedResponse);
      // Store in localStorage for persistence
      localStorage.setItem(`org_${type}`, JSON.stringify({
        url: accessToken,
        instanceUrl
      }));
      onConnect({ url: accessToken, instanceUrl });
      setIsConnected(true);
      setOrgUrl(instanceUrl);
      // Clear the temporary session storage
      sessionStorage.removeItem(`oauth_response_${type}`);
    } else {
      // Check localStorage for existing connection
      const persistedData = localStorage.getItem(`org_${type}`);
      if (persistedData) {
        const data = JSON.parse(persistedData);
        onConnect(data);
        setIsConnected(true);
        setOrgUrl(data.instanceUrl);
      }
    }
  }, [onConnect, type]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const clientId = type === "source" 
        ? "3MVG96MLzwkgoRznGPRExh_X5wx1bF7I7E8umgNxCoRvkksti.ivQTsLieZg9ekfSl7c5pPSfrP5SGgPsJ6TR"
        : "3MVG96MLzwkgoRzmQaEDPjvHCWAJXHUTiZR91dLUuHQyooEFejSLWz8LtrIrLGFeJfevyrF0Gfeeb7Bk8_6gw";
      
      const redirectUri = encodeURIComponent('https://preview--deploy-diff-magic-1.lovable.app/oauth/callback');
      const loginUrl = "https://test.salesforce.com/services/oauth2/authorize";
      const state = encodeURIComponent(JSON.stringify({ type }));
      const url = `${loginUrl}?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
      
      window.location.href = url;
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`org_${type}`);
    setIsConnected(false);
    setOrgUrl("");
    onDisconnect();
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
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Connected to {orgUrl}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-destructive hover:text-destructive/90"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
          >
            {isLoading ? "Connecting..." : `Login to ${type === "source" ? "Source" : "Target"} Org`}
          </Button>
        )}
      </div>
    </Card>
  );
};