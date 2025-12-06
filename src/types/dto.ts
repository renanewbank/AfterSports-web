export type InstructorDTO = {
  id: number
  name: string
  sport: string
  bio?: string | null
}

export type LessonDTO = {
  id: number
  instructorId: number
  title: string
  description?: string | null
  dateTime: string
  durationMinutes: number
  capacity: number
  priceCents: number
  lat: number
  lon: number
}

export type LessonCreate = Omit<LessonDTO, 'id'>
export type LessonUpdate = Partial<Omit<LessonDTO, 'id'>>

export type BookingDTO = {
  id: number
  lessonId: number
  studentName: string
  studentEmail: string
  createdAt: string
}

export type BookingCreate = {
  lessonId: number
  studentName: string
  studentEmail: string
}

export type WeatherSummary = {
  date: string
  temperatureMax: number | null
  temperatureMin: number | null
  precipitationProbability: number | null
  summary: string
}
