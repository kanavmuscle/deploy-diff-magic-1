import { CompareResult } from "@/types/metadata";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface CompareResultsProps {
  results: CompareResult;
}

export const CompareResults = ({ results }: CompareResultsProps) => {
  if (!results) return null;

  return (
    <Card className="h-[600px] backdrop-blur-sm bg-white/80 shadow-sm">
      <Tabs defaultValue="changed" className="w-full h-full">
        <TabsList className="w-full justify-start border-b rounded-none px-4">
          <TabsTrigger value="changed" className="relative">
            Changed
            {results.changed.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {results.changed.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="new">
            New
            {results.new.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                {results.new.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deleted">
            Deleted
            {results.deleted.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {results.deleted.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="nochange">
            No Change
            {results.noChange.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {results.noChange.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100%-48px)]">
          <TabsContent value="changed" className="p-4 m-0">
            {results.changed.map((item, index) => (
              <div
                key={item.id}
                className="mb-6 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-2 text-secondary">
                  {item.name}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({item.type})
                  </span>
                </h3>
                <div className="space-y-2">
                  {item.differences.map((diff, diffIndex) => (
                    <div
                      key={diffIndex}
                      className="grid grid-cols-2 gap-4 text-sm"
                    >
                      <div className="p-2 bg-red-50 rounded">
                        <span className="text-red-600">-</span> {diff.source}
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-green-600">+</span> {diff.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="new" className="p-4 m-0">
            {results.new.map((item, index) => (
              <div
                key={item.id}
                className="mb-4 p-3 bg-green-50 rounded-md animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-medium text-green-700">
                  {item.name}
                  <span className="text-sm font-normal text-green-600 ml-2">
                    ({item.type})
                  </span>
                </h3>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="deleted" className="p-4 m-0">
            {results.deleted.map((item, index) => (
              <div
                key={item.id}
                className="mb-4 p-3 bg-red-50 rounded-md animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-medium text-red-700">
                  {item.name}
                  <span className="text-sm font-normal text-red-600 ml-2">
                    ({item.type})
                  </span>
                </h3>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="nochange" className="p-4 m-0">
            {results.noChange.map((item, index) => (
              <div
                key={item.id}
                className="mb-4 p-3 bg-gray-50 rounded-md animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-medium text-gray-700">
                  {item.name}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({item.type})
                  </span>
                </h3>
              </div>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};