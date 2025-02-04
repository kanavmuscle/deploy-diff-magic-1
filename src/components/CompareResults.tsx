import { CompareResult } from "@/types/metadata";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CompareResultsProps {
  results: CompareResult;
}

const METADATA_TYPES = ['CustomField', 'CustomObject', 'ApexClass'] as const;

const formatCustomField = (name: string) => {
  // Assuming name is in format "Object.Field" or just "Field"
  const parts = name.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return name;
};

const MetadataSection = ({ 
  items, 
  type,
  variant = 'default'
}: { 
  items: any[], 
  type: string,
  variant?: 'default' | 'changed'
}) => {
  const typeItems = items.filter(item => item.type === type);
  
  if (typeItems.length === 0) return null;

  return (
    <AccordionItem value={type}>
      <AccordionTrigger className="hover:no-underline">
        {type}
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {typeItems.length}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {variant === 'changed' ? (
          typeItems.map((item, index) => (
            <div
              key={item.id}
              className="mb-6 animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold mb-2 text-secondary">
                {type === 'CustomField' ? formatCustomField(item.name) : item.name}
              </h3>
              <div className="space-y-2">
                {item.differences.map((diff: any, diffIndex: number) => (
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
          ))
        ) : (
          <div className="space-y-2">
            {typeItems.map((item, index) => (
              <div
                key={item.id}
                className="p-2 rounded animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {type === 'CustomField' ? formatCustomField(item.name) : item.name}
              </div>
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

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
            <Accordion type="single" collapsible className="space-y-2">
              {METADATA_TYPES.map(type => (
                <MetadataSection 
                  key={type} 
                  type={type} 
                  items={results.changed}
                  variant="changed"
                />
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="new" className="p-4 m-0">
            <Accordion type="single" collapsible className="space-y-2">
              {METADATA_TYPES.map(type => (
                <MetadataSection key={type} type={type} items={results.new} />
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="deleted" className="p-4 m-0">
            <Accordion type="single" collapsible className="space-y-2">
              {METADATA_TYPES.map(type => (
                <MetadataSection key={type} type={type} items={results.deleted} />
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="nochange" className="p-4 m-0">
            <Accordion type="single" collapsible className="space-y-2">
              {METADATA_TYPES.map(type => (
                <MetadataSection key={type} type={type} items={results.noChange} />
              ))}
            </Accordion>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};