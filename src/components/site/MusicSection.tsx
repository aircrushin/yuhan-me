import { type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

const SPOTIFY_ARTIST_URL = 'https://open.spotify.com/artist/0ioqyBVFLM9ce0eFyLz2Ly'
const NETEASE_ARTIST_URL = 'https://music.163.com/#/artist?id=12120673'
const SPOTIFY_EMBED_URL =
  'https://open.spotify.com/embed/artist/0ioqyBVFLM9ce0eFyLz2Ly?utm_source=generator&theme=0'
const ARTIST_ART_URL =
  'https://image-cdn-fa.spotifycdn.com/image/ab6761610000517403e8d15c41758c1dd04922b5'

const EQUALIZER_BARS = [0.42, 0.78, 0.55, 0.94, 0.36, 0.88, 0.62, 0.71, 0.48, 0.9, 0.58, 0.76]

export function MusicSection() {
  return (
    <Section
      id="music"
      kicker={m.section_music_kicker()}
      title={m.section_music_title()}
      description={m.section_music_subtitle()}
      className="music-section"
    >
      <div className="music-stage">
        <div className="music-stage-copy">
          <p className="music-artist-mark" aria-label={m.section_music_artist()}>
            {m.section_music_artist()}
          </p>
          <p className="music-stage-note">{m.section_music_note()}</p>

          <div className="music-equalizer" aria-hidden="true">
            {EQUALIZER_BARS.map((level, index) => (
              <span
                key={index}
                className="music-equalizer-bar"
                style={
                  {
                    '--bar-level': level,
                    '--bar-delay': `${index * 0.09}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <div className="music-stage-media">
          <div
            className="music-art"
            style={{ backgroundImage: `url(${ARTIST_ART_URL})` }}
            role="img"
            aria-label={m.section_music_art_alt()}
          />
          <div className="music-embed-shell">
            <iframe
              title={m.section_music_embed_title()}
              src={SPOTIFY_EMBED_URL}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="music-platforms" aria-label={m.section_music_platforms_aria()}>
        <a
          href={SPOTIFY_ARTIST_URL}
          target="_blank"
          rel="noreferrer"
          className="music-platform music-platform-spotify"
        >
          <span className="music-platform-kicker">{m.section_music_spotify_kicker()}</span>
          <span className="music-platform-title">{m.section_music_spotify_title()}</span>
          <span className="music-platform-meta">
            {m.section_music_spotify_meta()}
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </a>
        <a
          href={NETEASE_ARTIST_URL}
          target="_blank"
          rel="noreferrer"
          className="music-platform music-platform-netease"
        >
          <span className="music-platform-kicker">{m.section_music_netease_kicker()}</span>
          <span className="music-platform-title">{m.section_music_netease_title()}</span>
          <span className="music-platform-meta">
            {m.section_music_netease_meta()}
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </a>
      </div>
    </Section>
  )
}
