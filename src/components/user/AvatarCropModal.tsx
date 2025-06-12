import { useState } from "react"
import { CCrop } from "../common/CCrop"
import { Stack, Button, Group, Divider, Image } from "@mantine/core"
import { useMedia } from "../../hooks/useMedia"
import { CToast } from "../common/CToast"
import { useUsers } from "../../hooks/useUsers"
import { useMutation } from "@tanstack/react-query"
import { UpdateAvatarRequest } from "../../hooks/models"
import { modals } from "@mantine/modals"

interface Props {
  file: string
}

export const AvatarCropModal = ({ file }: Props) => {
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { uploadMedia } = useMedia()
  const { updateAvatar } = useUsers()

  // Cập nhật preview khi crop xong
  const handleCropped = (file: File) => {
    setCroppedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const { mutate: updateAvatarMutate, isPending: isUpdatingAvatar } =
    useMutation({
      mutationFn: (req: UpdateAvatarRequest) => updateAvatar(req),
      onSuccess: (response) => {
        CToast.success({
          title: response.data?.message || "Đổi avatar thành công"
        })
        modals.closeAll()
      },
      onError: (error) => {
        CToast.error({
          title: "Cập nhật ảnh đại diện thất bại",
          subtitle: error?.message || String(error)
        })
      }
    })

  const { mutate: uploadMediaMutate, isPending: isUploading } = useMutation({
    mutationFn: () => {
      if (!croppedImage) throw new Error("No image selected")
      return uploadMedia(croppedImage, "image")
    },
    onSuccess: (response) => {
      if (response.secure_url) {
        updateAvatarMutate({ avatarUrl: response.secure_url })
      } else {
        CToast.error({ title: "Tải ảnh lên thất bại: Không có secure_url" })
      }
    },
    onError: (error) => {
      CToast.error({
        title: "Tải ảnh lên thất bại",
        subtitle: error?.message || String(error)
      })
    }
  })

  return (
    <Stack>
      <Group>
        <CCrop imageSrc={file} onSave={handleCropped} className="grow" />
        <Divider orientation="vertical" />
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Cropped Avatar"
            maw={150}
            mah={150}
            radius="10000"
          />
        )}
      </Group>
      <Button
        onClick={() => uploadMediaMutate()}
        loading={isUploading || isUpdatingAvatar}
        disabled={!croppedImage}
      >
        Lưu ảnh đại diện
      </Button>
    </Stack>
  )
}
