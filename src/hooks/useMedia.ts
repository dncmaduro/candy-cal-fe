import axios from "axios"

export const useMedia = () => {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY as string
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string

  const uploadMedia = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)
    formData.append("api_key", apiKey)

    const response = await axios({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    })

    const data = response.data
    return data
  }

  return { uploadMedia }
}
