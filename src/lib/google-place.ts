export type GooglePlace = {
  placeId: string | null
  locationName: string
  formattedAddress: string
  latitude: number | null
  longitude: number | null
  googleMapsUrl: string
}

/** Place (New) id values are often `places/ChIJ…`; store the legacy-style id only. */
export function normalizePlaceId(id: string | undefined): string | null {
  if (!id) return null
  return id.startsWith('places/') ? id.slice('places/'.length) : id
}

export function readLatLng(loc: unknown): { lat: number; lng: number } | null {
  if (!loc || typeof loc !== 'object') return null
  const o = loc as { lat?: unknown; lng?: unknown }
  if (typeof o.lat === 'function' && typeof o.lng === 'function') {
    return { lat: (o.lat as () => number)(), lng: (o.lng as () => number)() }
  }
  if (typeof o.lat === 'number' && typeof o.lng === 'number') {
    return { lat: o.lat, lng: o.lng }
  }
  return null
}

/** Maps JS Place.displayName is usually a string; tolerate LocalizedText-shaped values. */
export function readDisplayName(displayName: unknown): string {
  if (typeof displayName === 'string') return displayName
  if (displayName && typeof displayName === 'object' && 'text' in displayName) {
    const text = (displayName as { text?: unknown }).text
    if (typeof text === 'string') return text
  }
  return ''
}

/** Field names required by Place.fetchFields / Place property access (Maps JS API). */
export const PLACE_DETAIL_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'googleMapsURI',
] as const

export type PlaceFieldsResult = {
  id?: string
  displayName?: unknown
  formattedAddress?: string
  location?: unknown
  /** Maps JavaScript API uses URI (all caps), not Uri. */
  googleMapsURI?: string
  fetchFields: (opts: { fields: string[] }) => Promise<unknown>
}

export function placeToGooglePlace(place: PlaceFieldsResult): GooglePlace {
  const ll = readLatLng(place.location)
  return {
    placeId: normalizePlaceId(place.id),
    locationName: readDisplayName(place.displayName),
    formattedAddress: place.formattedAddress ?? '',
    latitude: ll?.lat ?? null,
    longitude: ll?.lng ?? null,
    googleMapsUrl: place.googleMapsURI ?? '',
  }
}
