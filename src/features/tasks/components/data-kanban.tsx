import React, { useCallback, useEffect, useState } from "react"

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from "@hello-pangea/dnd"

import { Task, TaskStatus } from "../types"
import { KanbanColumnHeader } from "./kanban-column-header"
import { KanbanCard } from "./kanban-card"


const boards: TaskStatus[] = [
  TaskStatus.BACKLOG ,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
]

type TaskState = {
  [key in TaskStatus]: Task[]
}

interface DataKanbanProps {
  data: Task[];
  onChange: (tasks: { $id: string; status: TaskStatus; position: number;}[]) => void
}


export const DataKanban = ({ data, onChange }: DataKanbanProps) => {

  const [tasks, setTasks] = useState<TaskState>(() => {
    const initialTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    }

    data.forEach((task) => {
        initialTasks[task.status].push(task)
    })

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort((a,b) => a.position - b.position)
    })

    return initialTasks
  })

  useEffect(() => {
    const newTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    }

    data.forEach((task) => {
      newTasks[task.status].push(task)
    })

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a,b) => a.position - b.position)
    })

    setTasks(newTasks)

  }, [data])


  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    let updatesPayload: { $id: string; status: TaskStatus; position: number; }[] = []

    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks }

      //safely remove the task from souce column
      const sourceColumn = [...newTasks[sourceStatus]]
      const [movedTasks] = sourceColumn.splice(source.index, 1)

      //if there's no moved task, return what existed previously
      if (!movedTasks) {
        console.error("No task found at the source index")
        return prevTasks
      }

      //create a new task with potentially updated status (kanban column)
      const updatedMovedTasks = sourceStatus !== destStatus ? { ...movedTasks, status: destStatus } : movedTasks
      
      // update the source column
      newTasks[sourceStatus] = sourceColumn

      //add task to the destination column
      const destColumn = [...newTasks[destStatus]]
      destColumn.splice(destination.index, 0, updatedMovedTasks)
      newTasks[destStatus] = destColumn

      //prepare minimal update payload
      updatesPayload = []

      //update the moved task
      updatesPayload.push({
        $id: updatedMovedTasks.$id,
        status: destStatus,
        position: Math.min((destination.index + 1) * 1000, 1_000_000)
      })

      //update positions for moved tasks in destination column
      newTasks[destStatus].forEach((task, index) => {
        if (task && task.$id !== updatedMovedTasks.$id) {
          const newPosition = Math.min((index + 1 ) * 1000, 1_000_000)
          if (task.position !== newPosition) {
            updatesPayload.push({
              $id: task.$id,
              status: destStatus,
              position: newPosition
            })
          }
        }
      })

      //if the task moved between columns, also update positions in source column to reflect new order
      if (sourceStatus !== destStatus) {
        newTasks[sourceStatus].forEach((task, index) => {
          if (task) {
            const newPosition = Math.min((index + 1 ) * 1000, 1_000_000) 
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: sourceStatus,
                position: newPosition
              })
            }
          }
        })
      }
      return newTasks
    })

    onChange(updatesPayload)
  }, [onChange])
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable
                        key={task.$id}
                        draggableId={task.$id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}