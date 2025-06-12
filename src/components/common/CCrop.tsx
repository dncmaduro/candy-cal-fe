import { useState, useCallback, useEffect } from "react"
import Cropper, { Area } from "react-easy-crop"
import { Slider, Stack, Box } from "@mantine/core"
import getCroppedImg from "../../utils/cropper"

interface ImageCropProps {
  imageSrc: string
  onSave: (file: File) => void
  className?: string
}

export const CCrop: React.FC<ImageCropProps> = ({
  imageSrc,
  onSave,
  className
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  useEffect(() => {
    const changeCrop = async () => {
      if (!croppedAreaPixels) return
      const file = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (file) {
        onSave(file)
      }
    }

    changeCrop()
  }, [croppedAreaPixels])

  return (
    <Stack className={className}>
      <Box className="relative h-[400px] w-full bg-gray-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          maxZoom={4}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </Box>
      <Box className="flex flex-col items-center gap-2">
        <Slider
          value={zoom}
          min={1}
          max={4}
          step={0.1}
          onChange={setZoom}
          className="w-60"
        />
      </Box>
    </Stack>
  )
}
