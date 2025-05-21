export interface Property {
  id: string
  name: string
  address?: string
  listingAgent?: string
  listingPrice?: number
  squareFootage?: number
  bedrooms?: number
  listingUrl?: string
  listingPdf?: string
  floorplans?: string[]
  photos?: string[]
  coverPhotoIndex?: number
  rating?: number | null
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  propertyId: string
  propertyName: string
  date: string
  time: string
  name: string
  email: string
  phone?: string
  status?: string
  notes?: string
  createdAt: string
}

export interface Feedback {
  id: string
  propertyId: string
  propertyName: string
  text: string
  images?: string[]
  video?: string
  audio?: string
  createdAt: string
}
