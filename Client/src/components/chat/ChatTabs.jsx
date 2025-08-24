import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatTabs = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 h-11 md:h-10">
        <TabsTrigger
          value="all"
          className="text-sm md:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[36px] md:min-h-[32px]"
        >
          All
        </TabsTrigger>
        <TabsTrigger
          value="groups"
          className="text-sm md:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[36px] md:min-h-[32px]"
        >
          Groups
        </TabsTrigger>
        <TabsTrigger
          value="people"
          className="text-sm md:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[36px] md:min-h-[32px]"
        >
          People
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ChatTabs;
