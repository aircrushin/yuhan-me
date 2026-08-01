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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import {
  PLACE_DETAIL_FIELDS,
  placeToGooglePlace,
  type GooglePlace,
  type PlaceFieldsResult,
} from '#/lib/google-place'
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
            <DialogDescription className="sr-only">
              Add or edit a LiveDrop photo wall, optional Google Maps place, and embed URL.
            </DialogDescription>
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
                onPlace={(place) => setDraft((prev) => ({ ...prev, ...place }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location metadata</Label>
              <div className="surface-card space-y-1 p-3 text-xs text-[color:var(--sea-ink-soft)]">
                <p className="font-medium text-[color:var(--sea-ink)]">
                  {draft.locationName || draft.formattedAddress || 'No place selected'}
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

type GmpSelectEvent = Event & {
  placePrediction?: { toPlace: () => PlaceFieldsResult }
}

type PlaceAutocompleteWidget = HTMLElement & {
  value: string
}

function GooglePlaceSearch({
  defaultValue,
  onPlace,
}: {
  defaultValue: string
  onPlace: (place: GooglePlace) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<PlaceAutocompleteWidget | null>(null)
  const onPlaceRef = useRef(onPlace)
  const defaultValueRef = useRef(defaultValue)
  const [status, setStatus] = useState<
    'idle' | 'ready' | 'missing-key' | 'failed' | 'api-blocked'
  >('idle')
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  defaultValueRef.current = defaultValue

  useEffect(() => {
    onPlaceRef.current = onPlace
  }, [onPlace])

  useEffect(() => {
    const el = widgetRef.current
    if (!el) return
    if (el.value !== defaultValue) el.value = defaultValue
  }, [defaultValue])

  useEffect(() => {
    if (!apiKey) {
      setStatus('missing-key')
      return
    }

    let cancelled = false

    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (cancelled || !wrapRef.current) return
        const ctor = window.google?.maps?.places?.PlaceAutocompleteElement
        if (!ctor) {
          setStatus('failed')
          return
        }

        const el = new ctor({
          placeholder: 'Search a place on Google Maps',
          value: defaultValueRef.current,
        })
        widgetRef.current = el as PlaceAutocompleteWidget
        el.style.width = '100%'
        el.style.minHeight = '2.25rem'
        el.style.borderRadius = '0.375rem'

        const onSelect = (event: Event) => {
          void (async () => {
            try {
              const ev = event as GmpSelectEvent
              const prediction = ev.placePrediction
              if (!prediction?.toPlace) {
                throw new Error('Place prediction missing from gmp-select event')
              }
              const place = prediction.toPlace()
              // Maps JS API field is googleMapsURI (URI), not googleMapsUri.
              await place.fetchFields({ fields: [...PLACE_DETAIL_FIELDS] })
              onPlaceRef.current(placeToGooglePlace(place))
            } catch {
              toast.error('Failed to load place details from Google Maps')
            }
          })()
        }

        const onError = () => setStatus('api-blocked')

        el.addEventListener('gmp-select', onSelect)
        el.addEventListener('gmp-error', onError)
        wrapRef.current.replaceChildren(el)
        setStatus('ready')
      })
      .catch(() => setStatus('failed'))

    return () => {
      cancelled = true
      widgetRef.current = null
      wrapRef.current?.replaceChildren()
    }
  }, [apiKey])

  return (
    <div className="space-y-2">
      <div className="relative min-h-9 w-full">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[color:var(--sea-ink-soft)]" />
        {apiKey ? (
          <div ref={wrapRef} className="w-full pl-8" />
        ) : (
          <Input
            disabled
            readOnly
            placeholder="Search a place on Google Maps"
            className="pl-9 opacity-50"
          />
        )}
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
      {status === 'api-blocked' ? (
        <p className="text-xs text-[color:var(--lacquer)]">
          Google blocked Places requests (often the Places API (New) is disabled, billing is off, or
          the API key is restricted). Enable{' '}
          <a
            href="https://console.cloud.google.com/apis/library/places.googleapis.com"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Places API (New)
          </a>{' '}
          for your Maps key project and allow <span className="font-mono">places.googleapis.com</span>.
          You can still save without a place.
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
      PlaceAutocompleteElement: new (opts?: {
        placeholder?: string
        value?: string
      }) => HTMLElement & { value: string }
    }
  }
}

declare global {
  interface Window {
    google?: GoogleMapsNamespace
    __googleMapsPlacesPromise?: Promise<GoogleMapsNamespace>
  }
}

function loadGoogleMapsPlaces(apiKey: string): Promise<GoogleMapsNamespace> {
  if (window.google?.maps?.places?.PlaceAutocompleteElement) {
    return Promise.resolve(window.google)
  }
  if (window.__googleMapsPlacesPromise) return window.__googleMapsPlacesPromise

  window.__googleMapsPlacesPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const fail = (err: Error) => {
      delete window.__googleMapsPlacesPromise
      reject(err)
    }

    const callbackName = `__googleMapsInit_${Math.random().toString(36).slice(2)}`
    ;(window as unknown as Record<string, () => void>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName]
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        resolve(window.google)
      } else {
        fail(new Error('Google Maps Places library is unavailable'))
      }
    }

    const script = document.createElement('script')
    script.async = true
    script.src =
      `https://maps.googleapis.com/maps/api/js?` +
      `key=${encodeURIComponent(apiKey)}` +
      `&loading=async` +
      `&libraries=places` +
      `&callback=${callbackName}`
    script.onerror = () => fail(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })

  return window.__googleMapsPlacesPromise
}
