import { Area } from "react-easy-crop"

const createImage = async (url: string): Promise<HTMLImageElement> => {
  const image = new Image()
  image.crossOrigin = "anonymous"
  image.src = url
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })
  return image
}

const getCroppedImg = async (
  imageSrc: string,
  cropArea: Area
): Promise<File | null> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return null

  canvas.width = cropArea.width
  canvas.height = cropArea.height

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  )

  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.jpg", {
          type: "image/jpeg"
        })
        resolve(file)
      } else {
        resolve(null)
      }
    }, "image/jpeg")
  })
}

export default getCroppedImg
