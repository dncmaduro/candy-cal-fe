import {
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  ActionIcon,
  Text
} from "@mantine/core"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { modals } from "@mantine/modals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { CToast } from "../common/CToast"
import { useSalesFunnel } from "../../hooks/useSalesFunnel"
import { UpdateFunnelInfoRequest } from "../../hooks/models"
import { useProvinces } from "../../hooks/useProvinces"
import { useSalesChannels } from "../../hooks/useSalesChannels"

interface UpdateFunnelInfoModalProps {
  funnelId: string
  currentData: {
    name: string
    province?: {
      _id: string
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    phoneNumber?: string
    secondaryPhoneNumbers?: string[]
    address?: string
    channel: string
    hasBuyed: boolean
    funnelSource: "ads" | "seeding" | "referral"
  }
  onSuccess?: () => void
}

export const UpdateFunnelInfoModal = ({
  funnelId,
  currentData,
  onSuccess
}: UpdateFunnelInfoModalProps) => {
  console.log(currentData.funnelSource)
  const queryClient = useQueryClient()
  const { updateFunnelInfo } = useSalesFunnel()
  const { getProvinces } = useProvinces()
  const { searchSalesChannels } = useSalesChannels()

  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces
  })

  const { data: channelsData } = useQuery({
    queryKey: ["salesChannels", "all"],
    queryFn: () => searchSalesChannels({ page: 1, limit: 999 })
  })

  const [secondaryPhones, setSecondaryPhones] = useState<string[]>(
    currentData.secondaryPhoneNumbers || []
  )

  const { register, handleSubmit, control } = useForm<UpdateFunnelInfoRequest>({
    defaultValues: {
      name: currentData.name,
      province: currentData.province?._id,
      phoneNumber: currentData.phoneNumber,
      address: currentData.address,
      channel: currentData.channel,
      hasBuyed: currentData.hasBuyed,
      funnelSource: currentData.funnelSource
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateFunnelInfoRequest) =>
      updateFunnelInfo(funnelId, data),
    onSuccess: () => {
      CToast.success({ title: "Cập nhật thông tin thành công" })
      queryClient.invalidateQueries({ queryKey: ["salesFunnel"] })
      modals.closeAll()
      onSuccess?.()
    },
    onError: (error: any) => {
      CToast.error({ title: error?.message || "Có lỗi xảy ra" })
    }
  })

  const onSubmit = (data: UpdateFunnelInfoRequest) => {
    mutate({
      ...data,
      secondaryPhoneNumbers: secondaryPhones.filter((p) => p.trim() !== "")
    })
  }

  const addSecondaryPhone = () => {
    setSecondaryPhones([...secondaryPhones, ""])
  }

  const removeSecondaryPhone = (index: number) => {
    setSecondaryPhones(secondaryPhones.filter((_, i) => i !== index))
  }

  const updateSecondaryPhone = (index: number, value: string) => {
    const newPhones = [...secondaryPhones]
    newPhones[index] = value
    setSecondaryPhones(newPhones)
  }

  const provinceOptions =
    provincesData?.data.provinces.map((province) => ({
      value: province._id,
      label: province.name
    })) || []

  const channelOptions =
    channelsData?.data.data.map((channel) => ({
      value: channel._id,
      label: channel.channelName
    })) || []

  const sourceOptions = [
    { value: "ads", label: "Ads" },
    { value: "seeding", label: "Seeding" },
    { value: "referral", label: "Giới thiệu" }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Tên khách hàng"
          placeholder="Nhập tên khách hàng"
          {...register("name")}
        />

        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Tỉnh/Thành phố"
              placeholder="Chọn tỉnh/thành phố"
              data={provinceOptions}
              searchable
              clearable
            />
          )}
        />

        <TextInput
          label="Số điện thoại chính"
          placeholder="Nhập số điện thoại chính"
          {...register("phoneNumber")}
        />

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Số điện thoại phụ
            </Text>
            <ActionIcon variant="light" size="sm" onClick={addSecondaryPhone}>
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          {secondaryPhones.map((phone, index) => (
            <Group key={index} gap="xs">
              <TextInput
                placeholder="Nhập số điện thoại phụ"
                value={phone}
                onChange={(e) => updateSecondaryPhone(index, e.target.value)}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removeSecondaryPhone(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>

        <TextInput
          label="Địa chỉ"
          placeholder="Nhập địa chỉ"
          {...register("address")}
        />

        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Kênh"
              placeholder="Chọn kênh"
              data={channelOptions}
              searchable
            />
          )}
        />

        <Controller
          name="funnelSource"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Nguồn"
              placeholder="Chọn nguồn"
              data={sourceOptions}
              searchable
            />
          )}
        />
        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={() => modals.closeAll()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" loading={isPending}>
            Cập nhật
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
