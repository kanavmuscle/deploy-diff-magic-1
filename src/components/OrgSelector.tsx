import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OrgSelectorProps {
  type: "source" | "target";
  onConnect: (credentials: { url: string; token: string }) => void;
}

export const OrgSelector = ({ type, onConnect }: OrgSelectorProps) => {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-sm animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-secondary">
        {type === "source" ? "Source Org" : "Target Org"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-secondary/80 mb-1 block">
            Instance URL
          </label>
          <Input
            placeholder="https://your-instance.salesforce.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-secondary/80 mb-1 block">
            Access Token
          </label>
          <Input
            type="password"
            placeholder="Your Salesforce access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={() => onConnect({ url, token })}
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
        >
          Connect
        </Button>
      </div>
    </Card>
  );
};