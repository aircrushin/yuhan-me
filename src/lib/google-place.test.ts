import { describe, expect, it } from 'vitest'

import {
  normalizePlaceId,
  placeToGooglePlace,
  readDisplayName,
  readLatLng,
} from './google-place'

describe('normalizePlaceId', () => {
  it('strips the places/ resource prefix', () => {
    expect(normalizePlaceId('places/ChIJP3Sa8ziYEmsRUKgyFmh9AQM')).toBe(
      'ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
    )
  })

  it('keeps legacy ids unchanged', () => {
    expect(normalizePlaceId('ChIJP3Sa8ziYEmsRUKgyFmh9AQM')).toBe(
      'ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
    )
  })

  it('returns null for empty ids', () => {
    expect(normalizePlaceId(undefined)).toBeNull()
    expect(normalizePlaceId('')).toBeNull()
  })
})

describe('readLatLng', () => {
  it('reads LatLng method accessors', () => {
    expect(
      readLatLng({
        lat: () => -33.8688,
        lng: () => 151.2093,
      }),
    ).toEqual({ lat: -33.8688, lng: 151.2093 })
  })

  it('reads plain numeric coordinates', () => {
    expect(readLatLng({ lat: 1, lng: 2 })).toEqual({ lat: 1, lng: 2 })
  })

  it('rejects incomplete values', () => {
    expect(readLatLng(null)).toBeNull()
    expect(readLatLng({ lat: 1 })).toBeNull()
  })
})

describe('readDisplayName', () => {
  it('reads string display names', () => {
    expect(readDisplayName('Sydney')).toBe('Sydney')
  })

  it('reads LocalizedText-shaped display names', () => {
    expect(readDisplayName({ text: 'Sydney', languageCode: 'en' })).toBe('Sydney')
  })

  it('returns an empty string for missing names', () => {
    expect(readDisplayName(undefined)).toBe('')
    expect(readDisplayName({})).toBe('')
  })
})

describe('placeToGooglePlace', () => {
  it('maps Place fields using googleMapsURI', () => {
    expect(
      placeToGooglePlace({
        id: 'places/ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
        displayName: 'Sydney',
        formattedAddress: 'Sydney NSW, Australia',
        location: { lat: -33.8688, lng: 151.2093 },
        googleMapsURI: 'https://maps.google.com/?cid=1',
        fetchFields: async () => undefined,
      }),
    ).toEqual({
      placeId: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
      locationName: 'Sydney',
      formattedAddress: 'Sydney NSW, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      googleMapsUrl: 'https://maps.google.com/?cid=1',
    })
  })
})
