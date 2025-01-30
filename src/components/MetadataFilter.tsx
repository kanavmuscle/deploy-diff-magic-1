import { Card } from "@/components/ui/card";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const METADATA_TYPES = [
  "ApexClass",
  "ApexTrigger",
  "CustomObject",
  "Layout",
  "Profile",
  "PermissionSet",
];

interface MetadataFilterProps {
  selectedTypes: string[];
  onTypeSelect: (type: string) => void;
}

export const MetadataFilter = ({
  selectedTypes,
  onTypeSelect,
}: MetadataFilterProps) => {
  return (
    <Card className="p-4 backdrop-blur-sm bg-white/80 shadow-sm">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search metadata types..."
          className="pl-9"
        />
      </div>
      <div className="space-y-1">
        {METADATA_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`w-full px-3 py-2 text-left rounded-md transition-colors ${
              selectedTypes.includes(type)
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            }`}
          >
            <span className="flex items-center">
              {selectedTypes.includes(type) && (
                <Check className="h-4 w-4 mr-2 text-primary" />
              )}
              <span className={selectedTypes.includes(type) ? "ml-6" : "ml-8"}>
                {type}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};