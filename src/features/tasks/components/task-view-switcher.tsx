import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
 } from "@/components/ui/tabs"
import { DottedSeparator } from "@/components/dotted-separator"

export const TaskViewSwitcher = async () => {
  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger 
              className="h-8 w-full lg:w-auto"
              value="table"
            >
              Table
            </TabsTrigger>
            <TabsTrigger 
              className="h-8 w-full lg:w-auto"
              value="kanban"
            >
              Kanban
            </TabsTrigger>
            <TabsTrigger 
              className="h-8 w-full lg:w-auto"
              value="calendar"
            >
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="w-full lg:w-auto">
            <PlusIcon className="size-4 mr-2"/>
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
          Data filters
        <DottedSeparator className="my-4" />
        <>
          <TabsContent className="mt-0" value="table">
            Data table
          </TabsContent>
          <TabsContent className="mt-0" value="kanban">
            Data kanban
          </TabsContent>
          <TabsContent className="mt-0" value="calendar">
            Data calendar
          </TabsContent>
        </>
      </div>
    </Tabs>
  )
}