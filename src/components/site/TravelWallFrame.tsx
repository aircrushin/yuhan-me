interface TravelWallFrameProps {
  name: string
  src: string
  className?: string
}

export function TravelWallFrame({ name, src, className }: TravelWallFrameProps) {
  return (
    <iframe
      src={src}
      title={`${name} LiveDrop live wall`}
      width="100%"
      allowFullScreen
      loading="lazy"
      className={className}
    />
  )
}
