"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface PropertyPhotoGalleryProps {
  photos: string[]
  coverPhotoIndex?: number
}

export default function PropertyPhotoGallery({ photos, coverPhotoIndex = 0 }: PropertyPhotoGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-video relative mb-4 bg-muted rounded-md overflow-hidden">
        <Image
          src="/placeholder.svg?height=400&width=800"
          alt="No property photos available"
          fill
          className="object-cover"
        />
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsLightboxOpen(true)
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <>
      <div className="space-y-2">
        {/* Main cover photo */}
        <div
          className="aspect-video relative mb-2 bg-muted rounded-md overflow-hidden cursor-pointer"
          onClick={() => openLightbox(coverPhotoIndex)}
        >
          <Image
            src={photos[coverPhotoIndex] || "/placeholder.svg"}
            alt="Property cover photo"
            fill
            className="object-cover"
          />
        </div>

        {/* Thumbnail gallery */}
        {photos.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`aspect-square relative bg-muted rounded-md overflow-hidden cursor-pointer ${
                  index === coverPhotoIndex ? "ring-2 ring-primary" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  openLightbox(index)
                }}
              >
                <Image
                  src={photo || "/placeholder.svg"}
                  alt={`Property photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-[4/3] md:aspect-[16/9] relative">
              <Image
                src={photos[currentPhotoIndex] || "/placeholder.svg"}
                alt={`Property photo ${currentPhotoIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setIsLightboxOpen(false)
              }}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 ml-2"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 mr-2"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            <div className="absolute bottom-2 inset-x-0 text-center text-white text-sm">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
