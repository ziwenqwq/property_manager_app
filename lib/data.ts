import { v4 as uuidv4 } from "uuid"
import type { Property, Booking, Feedback } from "./types"

// Mock data storage with initial data
const properties: Property[] = [
  {
    id: "50a0b942-b64f-42fb-97d5-58ffba6d4a24",
    name: "Luxury Waterfront Villa",
    address: "123 Oceanview Drive, Malibu, CA 90210",
    listingAgent: "Jane Smith",
    listingPrice: 2450000,
    squareFootage: 3200,
    bedrooms: 4,
    listingUrl: "https://example.com/luxury-villa",
    listingPdf: "/property-listing-document.png",
    rating: 9,
    photos: [
      "/placeholder.svg?height=800&width=1200&query=luxury waterfront villa exterior",
      "/placeholder.svg?height=800&width=1200&query=modern kitchen with ocean view",
      "/placeholder.svg?height=800&width=1200&query=luxury master bedroom with balcony",
      "/placeholder.svg?height=800&width=1200&query=swimming pool with ocean view",
    ],
    floorplans: [
      "/placeholder.svg?height=800&width=800&query=floor plan first floor",
      "/placeholder.svg?height=800&width=800&query=floor plan second floor",
    ],
    coverPhotoIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "724ad86b-7db4-4b6e-8d0a-5db651d4ffd5",
    name: "Modern Mountain Retreat",
    address: "789 Alpine Way, Aspen, CO 81611",
    listingAgent: "David Wilson",
    listingPrice: 3750000,
    squareFootage: 4100,
    bedrooms: 5,
    photos: [
      "/placeholder.svg?height=800&width=1200&query=modern mountain cabin exterior",
      "/placeholder.svg?height=800&width=1200&query=rustic living room with fireplace",
      "/placeholder.svg?height=800&width=1200&query=mountain view from deck",
    ],
    floorplans: ["/placeholder.svg?height=800&width=800&query=mountain cabin floor plan"],
    coverPhotoIndex: 0,
    rating: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Downtown Modern Loft",
    address: "456 Urban Street, Apt 7B, New York, NY 10001",
    listingAgent: "Michael Johnson",
    listingPrice: 1250000,
    squareFootage: 1800,
    bedrooms: 2,
    photos: [
      "/placeholder.svg?height=800&width=1200&query=modern urban loft interior",
      "/placeholder.svg?height=800&width=1200&query=city skyline view from apartment",
    ],
    coverPhotoIndex: 0,
    rating: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Suburban Family Home",
    address: "789 Maple Avenue, Chicago, IL 60007",
    listingAgent: "Robert Davis",
    listingPrice: 850000,
    squareFootage: 2500,
    bedrooms: 3,
    photos: [
      "/placeholder.svg?height=800&width=1200&query=suburban family home exterior",
      "/placeholder.svg?height=800&width=1200&query=backyard with patio and garden",
    ],
    coverPhotoIndex: 0,
    rating: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const bookings: Booking[] = [
  {
    id: uuidv4(),
    propertyId: "50a0b942-b64f-42fb-97d5-58ffba6d4a24",
    propertyName: "Luxury Waterfront Villa",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    time: "14:00",
    name: "Alex Thompson",
    email: "alex@example.com",
    phone: "555-123-4567",
    status: "scheduled", // Changed from "confirmed" to "scheduled"
    notes: "Interested in seeing the pool area and backyard",
    createdAt: new Date().toISOString(),
  },
]

const feedback: Feedback[] = [
  {
    id: uuidv4(),
    propertyId: "50a0b942-b64f-42fb-97d5-58ffba6d4a24",
    propertyName: "Luxury Waterfront Villa",
    text: "Absolutely stunning property with amazing ocean views. The master bedroom is spacious and the kitchen is well-equipped with high-end appliances.",
    images: [
      "/placeholder.svg?height=800&width=1200&query=ocean view from luxury villa balcony",
      "/placeholder.svg?height=800&width=1200&query=luxury villa master bathroom",
    ],
    video: "/placeholder.svg?height=800&width=1200&query=video placeholder",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
  {
    id: uuidv4(),
    propertyId: "50a0b942-b64f-42fb-97d5-58ffba6d4a24",
    propertyName: "Luxury Waterfront Villa",
    text: "The location is perfect, just steps from the beach. However, some of the appliances could use an update. The outdoor space is phenomenal for entertaining.",
    audio: "/placeholder.svg?height=50&width=320&query=audio waveform",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: uuidv4(),
    propertyId: "724ad86b-7db4-4b6e-8d0a-5db651d4ffd5",
    propertyName: "Modern Mountain Retreat",
    text: "Perfect mountain getaway with breathtaking views. The interior is beautifully designed with high-end finishes. Highly recommend!",
    images: ["/placeholder.svg?height=800&width=1200&query=mountain view from cabin window"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
  },
]

// Property functions
export function getProperties(): Property[] {
  return properties
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id)
}

export function addProperty(data: Omit<Property, "id" | "createdAt" | "updatedAt">): Property {
  const now = new Date().toISOString()
  const newProperty: Property = {
    id: uuidv4(),
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  properties.push(newProperty)
  return newProperty
}

export function updateProperty(id: string, data: Partial<Omit<Property, "id" | "createdAt" | "updatedAt">>): Property {
  const index = properties.findIndex((p) => p.id === id)

  if (index === -1) {
    throw new Error("Property not found")
  }

  const now = new Date().toISOString()
  const updatedProperty: Property = {
    ...properties[index],
    ...data,
    id,
    updatedAt: now,
  }

  properties[index] = updatedProperty

  // Update property name in bookings and feedback
  bookings.forEach((booking) => {
    if (booking.propertyId === id) {
      booking.propertyName = updatedProperty.name
    }
  })

  feedback.forEach((item) => {
    if (item.propertyId === id) {
      item.propertyName = updatedProperty.name
    }
  })

  return updatedProperty
}

// Rating functions
export function updatePropertyRating(id: string, rating: number | null): Property {
  return updateProperty(id, { rating })
}

// Booking functions
export function getAllBookings(): Booking[] {
  return bookings
}

export function getBookingsByPropertyId(propertyId: string): Booking[] {
  return bookings.filter((b) => b.propertyId === propertyId)
}

export function addBooking(data: Omit<Booking, "id" | "propertyName" | "createdAt">): Booking {
  const property = getPropertyById(data.propertyId)

  if (!property) {
    throw new Error("Property not found")
  }

  const newBooking: Booking = {
    id: uuidv4(),
    ...data,
    propertyName: property.name,
    createdAt: new Date().toISOString(),
  }

  bookings.push(newBooking)
  return newBooking
}

export function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Booking {
  const index = bookings.findIndex((b) => b.id === id)

  if (index === -1) {
    throw new Error("Booking not found")
  }

  const updatedBooking = {
    ...bookings[index],
    ...data,
  }

  bookings[index] = updatedBooking
  return updatedBooking
}

// Feedback functions
export function getAllFeedback(): Feedback[] {
  return feedback
}

export function getFeedbackByPropertyId(propertyId: string): Feedback[] {
  return feedback.filter((f) => f.propertyId === propertyId)
}

export function addFeedback(data: Omit<Feedback, "id" | "propertyName" | "createdAt">): Feedback {
  const property = getPropertyById(data.propertyId)

  if (!property) {
    throw new Error("Property not found")
  }

  const newFeedback: Feedback = {
    id: uuidv4(),
    ...data,
    propertyName: property.name,
    createdAt: new Date().toISOString(),
  }

  feedback.push(newFeedback)
  return newFeedback
}

export function updateFeedback(
  id: string,
  data: Partial<Omit<Feedback, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Feedback {
  const index = feedback.findIndex((f) => f.id === id)

  if (index === -1) {
    throw new Error("Feedback not found")
  }

  const updatedFeedback = {
    ...feedback[index],
    ...data,
  }

  feedback[index] = updatedFeedback
  return updatedFeedback
}
