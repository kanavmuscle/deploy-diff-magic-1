import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface OrgSelectorProps {
  type: "source" | "target";
  onConnect: (credentials: { url: string; instanceUrl: string }) => void;
}

export const OrgSelector = ({ type, onConnect }: OrgSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle OAuth response when the page loads
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const instanceUrl = params.get("instance_url");
      
      if (accessToken && instanceUrl) {
        onConnect({ url: accessToken, instanceUrl });
        // Clear the hash without redirecting
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  }, [onConnect]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Initialize OAuth flow
      const clientId = type === "source" 
        ? "3MVG96MLzwkgoRznGPRExh_X5wx1bF7I7E8umgNxCoRvkksti.ivQTsLieZg9ekfSl7c5pPSfrP5SGgPsJ6TR"
        : "3MVG96MLzwkgoRzmQaEDPjvHCWAJXHUTiZR91dLUuHQyooEFejSLWz8LtrIrLGFeJfevyrF0Gfeeb7Bk8_6gw";
      
      const redirectUri = encodeURIComponent("https://test.salesforce.com/services/oauth2/callback");
      const loginUrl = "https://test.salesforce.com/services/oauth2/authorize";
      const url = `${loginUrl}?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`;
      
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