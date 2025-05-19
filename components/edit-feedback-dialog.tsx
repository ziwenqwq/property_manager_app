"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { updateFeedback } from "@/lib/data"
import type { Feedback } from "@/lib/types"

const formSchema = z.object({
  text: z.string().min(1, "Feedback text is required"),
})

type FormValues = z.infer<typeof formSchema>

interface EditFeedbackDialogProps {
  feedback: Feedback | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComplete: () => void
}

export default function EditFeedbackDialog({ feedback, open, onOpenChange, onEditComplete }: EditFeedbackDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  })

  // Update form values when feedback changes or dialog opens
  useEffect(() => {
    if (feedback && open) {
      form.reset({
        text: feedback.text,
      })
    }
  }, [feedback, open, form])

  function onSubmit(values: FormValues) {
    if (!feedback) return

    setIsSubmitting(true)

    setTimeout(() => {
      updateFeedback(feedback.id, {
        text: values.text,
        // Preserve other fields
        images: feedback.images,
        video: feedback.video,
        audio: feedback.audio,
      })

      setIsSubmitting(false)
      onEditComplete()
      router.refresh()
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
          <DialogDescription>Update your feedback for this property.</DialogDescription>
        </DialogHeader>

        {feedback && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts about this property..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
