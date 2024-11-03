"use client"

import { z } from "zod";
import React, { useRef } from "react";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Image from "next/image" 
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConfirm } from "@/hooks/use-confirm";
 
import { updateProjectSchema } from "../schemas";
import { useUpdateProject } from "../api/use-update-project";
import { Project } from "../types";
import { useDeleteProject } from "../api/use-delete-project";

interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const EditProjectForm = ({onCancel, initialValues}: EditProjectFormProps) => {

  const router = useRouter()
  const { mutate, isPending } = useUpdateProject()
  const { mutate: deleteProject, isPending: isDeletingProject} = useDeleteProject()

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Project",
    "This action cannot be undone.",
    "destructive"
  )


  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? ""
    }
  })

  const handleDelete = async () => {
    const ok = await confirmDelete() 

    if (!ok) return;

    deleteProject({ 
      param: { projectId: initialValues.$id },
     }, {
      onSuccess: () => {
        const href = `/workspaces/${initialValues.workspaceId}`
        router.push(href)
      } 
    })
  }


  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    }
    mutate({ form: finalValues, param: { projectId: initialValues.$id } })
  }


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("image", file)
    } 
  } 

  return(
    <div className="flex flex-col gap-y-4">
      <DeleteDialog/>
      <Card className="w-full f-full border-none shadow-none">
          <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
            <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
              <ArrowLeftIcon className="size-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-xl font-bold">
               {initialValues.name}
            </CardTitle>
          </CardHeader>
          <div className="px-7">
            <DottedSeparator />
          </div>
          <CardContent className="p-7">
            <Form {...form} >
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Project name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter project name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-5">
                          {field.value ? (
                            <div className="size-[72px] relative rounded-md overflow-hidden">
                              <Image
                                alt="logo"
                                fill
                                className="object-cover"
                                src={field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                                }
                              />
                            </div>
                          ) : (
                            <Avatar className="size-[72px]">
                              <AvatarFallback>
                                <ImageIcon className="size-[36px] text-neutral-400"/>
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm">Project Icon</p>
                            <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1 mB</p>
                            <input
                              className="hidden"
                              accept=".jpg, .png, .jpeg, .svg"
                              type="file"
                              ref={inputRef}
                              disabled={isPending}
                              onChange={handleImageChange}
                            />
                             {field.value ? (
                              <Button
                                type="button"
                                disabled={isPending}
                                variant="destructive"
                                size="xs"
                                className="w-fit mt-2"
                                onClick={() => {
                                  field.onChange(null)
                                  if (inputRef.current) {
                                    inputRef.current.value = ""
                                  }
                                }}
                              >
                                Remove Image
                              </Button>
                            ) : (
                                  <Button
                                    type="button"
                                    disabled={isPending}
                                    variant="tertiary"
                                    size="xs"
                                    className="w-fit mt-2"
                                    onClick={() => inputRef.current?.click()}
                                  >
                                    Upload Image
                                  </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
                <DottedSeparator className="py-7"/>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isPending}
                    className={cn(!onCancel && "invisible" )}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
      </Card>
     
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is irreversible and will remove all associated data.
            </p>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 w-fit ml-auto"
              size="sm"
              variant="destructive"
              disabled={isPending || isDeletingProject}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
