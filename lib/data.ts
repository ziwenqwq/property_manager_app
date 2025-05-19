import { v4 as uuidv4 } from "uuid"
import type { Property, Booking, Feedback } from "./types"

// Mock data storage with initial data
const properties: Property[] = [
  {
    id: "50a0b942-b64f-42fb-97d5-58ffba6d4a24", // Using the ID from your URL
    name: "Luxury Waterfront Villa",
    address: "123 Oceanview Drive, Malibu, CA 90210",
    listingAgent: "Jane Smith",
    listingPrice: 2450000,
    squareFootage: 3200,
    bedrooms: 4,
    listingUrl: "https://example.com/luxury-villa",
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
    estateAgent: "Jane Smith",
    notes: "Remember to ask about the pool maintenance and HOA fees",
    createdAt: new Date().toISOString(),
  },
]

const feedback: Feedback[] = [
  {
    id: uuidv4(),
    propertyId: "50a0b942-b64f-42fb-97d5-58ffba6d4a24",
    propertyName: "Luxury Waterfront Villa",
    text: "Absolutely stunning property with amazing ocean views. The master bedroom is spacious and the kitchen is well-equipped with high-end appliances.",
    createdAt: new Date().toISOString(),
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

export function updateProperty(id: string, data: Omit<Property, "id" | "createdAt" | "updatedAt">): Property {
  const index = properties.findIndex((p) => p.id === id)

  if (index === -1) {
    throw new Error("Property not found")
  }

  const now = new Date().toISOString()
  const updatedProperty: Property = {
    id,
    ...data,
    createdAt: properties[index].createdAt,
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

export function removeBooking(id: string): void {
  const index = bookings.findIndex((b) => b.id === id)
  if (index !== -1) {
    bookings.splice(index, 1)
  }
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

export function removeFeedback(id: string): void {
  const index = feedback.findIndex((f) => f.id === id)
  if (index !== -1) {
    feedback.splice(index, 1)
  }
}
