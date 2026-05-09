import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { TravelDump } from '#/db/schema'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import {
  deleteTravelDump,
  listTravelDumpsAdmin,
  reorderTravelDumps,
  upsertTravelDump,
} from '#/server/admin'

export const Route = createFileRoute('/admin/_app/travel')({
  loader: () => listTravelDumpsAdmin(),
  component: AdminTravel,
  head: () => ({ meta: [{ title: 'Admin · Travel' }] }),
})

type Draft = Omit<TravelDump, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number
}

type GooglePlace = {
  placeId: string | null
  locationName: string
  formattedAddress: string
  latitude: number | null
  longitude: number | null
  googleMapsUrl: string
}

const EMPTY_DRAFT: Draft = {
  name: '',
  photoWallUrl: '',
  placeId: null,
  locationName: '',
  formattedAddress: '',
  latitude: null,
  longitude: null,
  googleMapsUrl: '',
  isVisible: true,
  displayOrder: 0,
}

function AdminTravel() {
  const initial = Route.useLoaderData()
  const router = useRouter()
  const [items, setItems] = useState<TravelDump[]>(initial)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const upsert = useServerFn(upsertTravelDump)
  const remove = useServerFn(deleteTravelDump)
  const reorder = useServerFn(reorderTravelDumps)

  useEffect(() => {
    setItems(initial)
  }, [initial])

  function startNew() {
    setDraft({ ...EMPTY_DRAFT, displayOrder: items.length })
    setOpen(true)
  }

  function startEdit(item: TravelDump) {
    setDraft({
      id: item.id,
      name: item.name,
      photoWallUrl: item.photoWallUrl,
      placeId: item.placeId,
      locationName: item.locationName,
      formattedAddress: item.formattedAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      googleMapsUrl: item.googleMapsUrl,
      isVisible: item.isVisible,
      displayOrder: item.displayOrder,
    })
    setOpen(true)
  }

  async function save() {
    try {
      await upsert({
        data: {
          ...draft,
          placeId: draft.placeId || null,
          latitude: draft.latitude ?? null,
          longitude: draft.longitude ?? null,
        },
      })
      toast.success('Saved')
      setOpen(false)
      await router.invalidate()
    } catch {
      toast.error('Failed to save')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this travel wall?')) return
    try {
      await remove({ data: { id } })
      toast.success('Deleted')
      await router.invalidate()
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function move(item: TravelDump, direction: -1 | 1) {
    const ordered = [...items]
    const idx = ordered.findIndex((row) => row.id === item.id)
    if (idx === -1) return
    const swap = idx + direction
    if (swap < 0 || swap >= ordered.length) return
    ;[ordered[idx], ordered[swap]] = [ordered[swap]!, ordered[idx]!]
    setItems(ordered)
    try {
      await reorder({ data: { ids: ordered.map((row) => row.id) } })
      await router.invalidate()
    } catch {
      toast.error('Failed to reorder')
      setItems(items)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Travel
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Manage embedded LiveDrop photo walls and their Google Maps locations.
          </p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add wall
        </Button>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface)] text-left text-[11px] uppercase tracking-[0.14em] text-[color:var(--sea-ink-soft)]">
            <tr>
              <th className="w-14 px-3 py-3">Order</th>
              <th className="px-3 py-3">Wall</th>
              <th className="px-3 py-3">Location</th>
              <th className="w-20 px-3 py-3 text-center">Visible</th>
              <th className="w-24 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-t border-[var(--line)]">
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(item, -1)}
                      disabled={index === 0}
                      className="rounded border border-[var(--line)] p-1 text-[color:var(--sea-ink-soft)] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(item, 1)}
                      disabled={index === items.length - 1}
                      className="rounded border border-[var(--line)] p-1 text-[color:var(--sea-ink-soft)] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <a
                    href={item.photoWallUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[color:var(--sea-ink)] hover:underline"
                  >
                    {item.name}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <p className="mt-1 max-w-md truncate text-xs text-[color:var(--sea-ink-soft)]">
                    {item.photoWallUrl}
                  </p>
                </td>
                <td className="px-3 py-3 align-middle text-xs text-[color:var(--sea-ink-soft)]">
                  {item.locationName || item.formattedAddress || '—'}
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  <Switch
                    checked={item.isVisible}
                    onCheckedChange={async (checked) => {
                      setItems((rows) =>
                        rows.map((row) =>
                          row.id === item.id ? { ...row, isVisible: checked } : row,
                        ),
                      )
                      try {
                        await upsert({ data: { ...item, isVisible: checked } })
                      } catch {
                        toast.error('Failed to update')
                        setItems(items)
                      }
                    }}
                  />
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    <Button size="icon-sm" variant="ghost" onClick={() => startEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-sm text-[color:var(--sea-ink-soft)]">
                  No travel walls yet. Add your first LiveDrop embed.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit travel wall' : 'New travel wall'}</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-1 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="大理旅居"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Google Maps place</Label>
              <GooglePlaceSearch
                defaultValue={draft.locationName || draft.formattedAddress}
                onPlace={(place) => setDraft({ ...draft, ...place })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location metadata</Label>
              <div className="surface-card space-y-1 p-3 text-xs text-[color:var(--sea-ink-soft)]">
                <p className="font-medium text-[color:var(--sea-ink)]">
                  {draft.locationName || 'No place selected'}
                </p>
                {draft.formattedAddress ? <p>{draft.formattedAddress}</p> : null}
                {draft.latitude !== null && draft.longitude !== null ? (
                  <p>
                    {draft.latitude}, {draft.longitude}
                  </p>
                ) : null}
                {draft.googleMapsUrl ? (
                  <a
                    href={draft.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[color:var(--lagoon-deep)] hover:underline"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Iframe embed URL</Label>
              <Input
                value={draft.photoWallUrl}
                onChange={(e) => setDraft({ ...draft, photoWallUrl: e.target.value })}
                placeholder="http://localhost:3000/live/-h2hd?embed=1"
              />
            </div>
            <div className="space-y-2">
              <Label>Display order</Label>
              <Input
                type="number"
                value={draft.displayOrder}
                onChange={(e) =>
                  setDraft({ ...draft, displayOrder: Number(e.target.value || 0) })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--line)] px-3 py-2">
              <div>
                <Label>Visible</Label>
                <p className="mt-1 text-xs text-[color:var(--sea-ink-soft)]">
                  Hidden walls stay out of the public site.
                </p>
              </div>
              <Switch
                checked={draft.isVisible}
                onCheckedChange={(checked) => setDraft({ ...draft, isVisible: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GooglePlaceSearch({
  defaultValue,
  onPlace,
}: {
  defaultValue: string
  onPlace: (place: GooglePlace) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onPlaceRef = useRef(onPlace)
  const [query, setQuery] = useState(defaultValue)
  const [status, setStatus] = useState<'idle' | 'ready' | 'missing-key' | 'failed'>('idle')
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  useEffect(() => {
    onPlaceRef.current = onPlace
  }, [onPlace])

  useEffect(() => {
    setQuery(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    if (!apiKey) {
      setStatus('missing-key')
      return
    }

    let cancelled = false
    loadGoogleMapsPlaces(apiKey)
      .then((google) => {
        if (cancelled || !inputRef.current) return
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'url'],
        })
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          const location = place.geometry?.location
          const selected = {
            placeId: place.place_id ?? null,
            locationName: place.name ?? '',
            formattedAddress: place.formatted_address ?? '',
            latitude: location ? location.lat() : null,
            longitude: location ? location.lng() : null,
            googleMapsUrl: place.url ?? '',
          }
          setQuery(selected.locationName || selected.formattedAddress)
          onPlaceRef.current(selected)
        })
        setStatus('ready')
      })
      .catch(() => setStatus('failed'))

    return () => {
      cancelled = true
    }
  }, [apiKey])

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--sea-ink-soft)]" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={!apiKey}
          placeholder="Search a place on Google Maps"
          className="pl-9"
        />
      </div>
      {status === 'missing-key' ? (
        <p className="text-xs text-[color:var(--lacquer)]">
          Set VITE_GOOGLE_MAPS_API_KEY to enable Google Places selection.
        </p>
      ) : null}
      {status === 'failed' ? (
        <p className="text-xs text-[color:var(--lacquer)]">
          Google Places failed to load. You can still save the travel wall without a place.
        </p>
      ) : null}
      {status === 'ready' ? (
        <p className="text-xs text-[color:var(--sea-ink-soft)]">
          Choose a Google Maps result to fill the location metadata.
        </p>
      ) : null}
    </div>
  )
}

type GoogleMapsNamespace = {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: { fields: string[] },
      ) => {
        addListener: (eventName: 'place_changed', handler: () => void) => void
        getPlace: () => {
          place_id?: string
          name?: string
          formatted_address?: string
          url?: string
          geometry?: {
            location?: {
              lat: () => number
              lng: () => number
            }
          }
        }
      }
    }
  }
}

declare global {
  interface Window {
    google?: GoogleMapsNamespace
    __googleMapsPlacesPromise?: Promise<GoogleMapsNamespace>
  }
}

function loadGoogleMapsPlaces(apiKey: string) {
  if (window.google?.maps.places) return Promise.resolve(window.google)
  if (window.__googleMapsPlacesPromise) return window.__googleMapsPlacesPromise

  window.__googleMapsPlacesPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.maps.places) {
        resolve(window.google)
      } else {
        reject(new Error('Google Maps Places library is unavailable'))
      }
    }
    script.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })

  return window.__googleMapsPlacesPromise
}
