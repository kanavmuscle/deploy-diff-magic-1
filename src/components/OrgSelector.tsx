import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface OrgSelectorProps {
  type: "source" | "target";
  onConnect: (credentials: { url: string; instanceUrl: string }) => void;
}

export const OrgSelector = ({ type, onConnect }: OrgSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [orgUrl, setOrgUrl] = useState<string>("");

  useEffect(() => {
    // Check for stored OAuth response
    const storedResponse = sessionStorage.getItem("oauth_response");
    if (storedResponse) {
      const { accessToken, instanceUrl } = JSON.parse(storedResponse);
      onConnect({ url: accessToken, instanceUrl });
      setIsConnected(true);
      setOrgUrl(instanceUrl);
      // Clear the stored response
      sessionStorage.removeItem("oauth_response");
    }
  }, [onConnect]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const clientId = type === "source" 
        ? "3MVG96MLzwkgoRznGPRExh_X5wx1bF7I7E8umgNxCoRvkksti.ivQTsLieZg9ekfSl7c5pPSfrP5SGgPsJ6TR"
        : "3MVG96MLzwkgoRzmQaEDPjvHCWAJXHUTiZR91dLUuHQyooEFejSLWz8LtrIrLGFeJfevyrF0Gfeeb7Bk8_6gw";
      
      const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
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
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Successfully connected to {orgUrl}</span>
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