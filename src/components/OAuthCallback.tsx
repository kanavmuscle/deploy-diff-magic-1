import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const instanceUrl = params.get("instance_url");
      
      if (accessToken && instanceUrl) {
        // Store OAuth response in sessionStorage
        sessionStorage.setItem("oauth_response", JSON.stringify({
          accessToken,
          instanceUrl,
        }));
        
        toast({
          title: "Successfully connected to Salesforce",
          description: "You can now proceed with the deployment process.",
        });

        // Redirect back to main page
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Unable to connect to Salesforce. Please try again.",
        });
        navigate("/");
      }
    }
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-muted">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;