import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiffViewerProps {
  differences: {
    type: string;
    name: string;
    changes: Array<{
      line: number;
      source: string;
      target: string;
    }>;
  }[];
}

export const DiffViewer = ({ differences }: DiffViewerProps) => {
  return (
    <Card className="h-[600px] backdrop-blur-sm bg-white/80 shadow-sm">
      <ScrollArea className="h-full">
        <div className="p-4">
          {differences.length === 0 ? (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              Select metadata types to compare
            </div>
          ) : (
            differences.map((diff, index) => (
              <div
                key={index}
                className="mb-6 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-2 text-secondary">
                  {diff.name}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({diff.type})
                  </span>
                </h3>
                <div className="space-y-2">
                  {diff.changes.map((change, changeIndex) => (
                    <div
                      key={changeIndex}
                      className="grid grid-cols-2 gap-4 text-sm"
                    >
                      <div className="p-2 bg-red-50 rounded">
                        <span className="text-red-600">-</span> {change.source}
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-green-600">+</span> {change.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};