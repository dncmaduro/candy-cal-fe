import {
  Box,
  Button,
  Group,
  Modal,
  createUseExternalEvents,
  getDefaultZIndex,
  type ButtonProps,
  type GroupProps,
  type ModalProps
} from "@mantine/core"
import { randomId } from "@mantine/hooks"
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useReducer,
  useRef
} from "react"

type ModalSettings = Partial<Omit<ModalProps, "opened">> & {
  modalId?: string
  skipCloseConfirmation?: boolean
}

type ConfirmLabels = Record<"confirm" | "cancel", ReactNode>

type ConfirmButtonProps = ButtonProps & {
  children?: ReactNode
}

type ContextModalComponent = (props: {
  context: ConfirmingModalsContext
  innerProps: Record<string, any>
  id: string
}) => ReactNode

interface ConfirmModalSettings extends ModalSettings {
  children?: ReactNode
  labels?: ConfirmLabels
  onCancel?: () => void
  onConfirm?: () => void
  closeOnConfirm?: boolean
  closeOnCancel?: boolean
  cancelProps?: ConfirmButtonProps
  confirmProps?: ConfirmButtonProps
  groupProps?: GroupProps
}

interface OpenContextModalSettings extends ModalSettings {
  innerProps: Record<string, any>
}

type ModalState =
  | {
      id: string
      type: "content"
      props: ModalSettings & { children?: ReactNode }
    }
  | {
      id: string
      type: "confirm"
      props: ConfirmModalSettings
    }
  | {
      id: string
      type: "context"
      ctx: string
      props: OpenContextModalSettings
    }
  | {
      id: string
      type: "close-confirm"
      targetId: string
      props: ConfirmModalSettings
    }

interface ModalsState {
  current: ModalState | null
  modals: ModalState[]
}

type ModalsAction =
  | { type: "OPEN"; modal: ModalState }
  | { type: "CLOSE"; modalId: string; canceled?: boolean }
  | { type: "CLOSE_ALL"; canceled?: boolean }
  | {
      type: "UPDATE"
      modalId: string
      newProps: Partial<ModalSettings | ConfirmModalSettings | OpenContextModalSettings>
    }

interface ConfirmingModalsContext {
  modalProps: ModalSettings
  modals: ModalState[]
  openModal: (props: ModalSettings & { children?: ReactNode }) => string
  openConfirmModal: (props: ConfirmModalSettings) => string
  openContextModal: (
    modal: string,
    props: OpenContextModalSettings
  ) => string
  closeModal: (id: string, canceled?: boolean) => void
  closeContextModal: (id: string, canceled?: boolean) => void
  closeAll: () => void
  updateModal: (payload: { modalId: string } & Partial<ModalSettings>) => void
  updateContextModal: (
    payload: { modalId: string } & Partial<OpenContextModalSettings>
  ) => void
}

type ModalsEvents = Record<string, (detail: any) => void> & {
  openModal: (payload: ModalSettings & { children?: ReactNode; modalId?: string }) => void
  openConfirmModal: (payload: ConfirmModalSettings & { modalId?: string }) => void
  openContextModal: (
    payload: OpenContextModalSettings & { modal: string; modalId?: string }
  ) => void
  closeModal: (modalId: string) => void
  closeContextModal: (modalId: string) => void
  closeAllModals: () => void
  updateModal: (payload: { modalId: string } & Partial<ModalSettings>) => void
  updateContextModal: (
    payload: { modalId: string } & Partial<OpenContextModalSettings>
  ) => void
}

interface ConfirmingModalsProviderProps {
  children: ReactNode
  modalProps?: ModalSettings
  labels?: ConfirmLabels
  modals?: Record<string, ContextModalComponent>
}

const CLOSE_TRIGGER_LABELS = new Set(["Hủy", "Đóng", "Cancel", "Close"])
const DEFAULT_CLOSE_CONFIRM_LABELS: ConfirmLabels = {
  confirm: "Đóng",
  cancel: "Ở lại"
}

const [useConfirmingModalsEvents] =
  createUseExternalEvents<ModalsEvents>("mantine-modals")

const normalizeLabel = (value: string | null | undefined) =>
  value?.replace(/\s+/g, " ").trim() || ""

const separateBaseModalProps = (props: ModalSettings) => {
  const { modalId, skipCloseConfirmation, ...others } = props
  return others
}

const separateConfirmModalProps = (props: ConfirmModalSettings) => {
  const {
    modalId,
    children,
    onCancel,
    onConfirm,
    closeOnConfirm,
    closeOnCancel,
    cancelProps,
    confirmProps,
    groupProps,
    labels,
    skipCloseConfirmation,
    ...others
  } = props

  return {
    modalProps: {
      modalId,
      skipCloseConfirmation,
      ...others
    } satisfies ModalSettings,
    confirmProps: {
      children,
      onCancel,
      onConfirm,
      closeOnConfirm,
      closeOnCancel,
      cancelProps,
      confirmProps,
      groupProps,
      labels,
      skipCloseConfirmation
    } satisfies ConfirmModalSettings
  }
}

const shouldInterceptDismissButton = (target: HTMLElement | null) => {
  const button = target?.closest("button")
  if (!button || button.disabled) {
    return false
  }

  if (button.dataset.skipCloseConfirm === "true") {
    return false
  }

  return CLOSE_TRIGGER_LABELS.has(normalizeLabel(button.textContent))
}

const handleCloseModal = (modal: ModalState, canceled?: boolean) => {
  if (canceled && modal.type === "confirm") {
    modal.props.onCancel?.()
  }

  if (canceled && modal.type === "close-confirm") {
    modal.props.onCancel?.()
  }

  modal.props.onClose?.()
}

const modalsReducer = (state: ModalsState, action: ModalsAction): ModalsState => {
  switch (action.type) {
    case "OPEN": {
      return {
        current: action.modal,
        modals: [...state.modals, action.modal]
      }
    }

    case "CLOSE": {
      const modal = state.modals.find((item) => item.id === action.modalId)
      if (!modal) {
        return state
      }

      handleCloseModal(modal, action.canceled)

      const remainingModals = state.modals.filter(
        (item) => item.id !== action.modalId
      )

      return {
        current: remainingModals[remainingModals.length - 1] || null,
        modals: remainingModals
      }
    }

    case "CLOSE_ALL": {
      if (!state.modals.length) {
        return state
      }

      state.modals
        .concat()
        .reverse()
        .forEach((modal) => {
          handleCloseModal(modal, action.canceled)
        })

      return {
        current: null,
        modals: []
      }
    }

    case "UPDATE": {
      const updatedModals = state.modals.map((modal) => {
        if (modal.id !== action.modalId) {
          return modal
        }

        if (modal.type === "context") {
          return {
            ...modal,
            props: {
              ...modal.props,
              ...action.newProps,
              innerProps: {
                ...modal.props.innerProps,
                ...(action.newProps as Partial<OpenContextModalSettings>).innerProps
              }
            }
          }
        }

        return {
          ...modal,
          props: {
            ...modal.props,
            ...action.newProps
          }
        }
      })

      const current =
        state.current?.id == null
          ? null
          : updatedModals.find((modal) => modal.id === state.current?.id) || null

      return {
        current,
        modals: updatedModals
      }
    }

    default: {
      return state
    }
  }
}

const ConfirmModalContent = ({
  id,
  labels = { cancel: "", confirm: "" },
  closeOnConfirm = true,
  closeOnCancel = true,
  cancelProps,
  confirmProps,
  groupProps,
  onCancel,
  onConfirm,
  children,
  onRequestClose
}: ConfirmModalSettings & {
  id: string
  onRequestClose: (modalId: string, canceled?: boolean) => void
}) => {
  const cancelClick = cancelProps as
    | { onClick?: (event: MouseEvent<HTMLButtonElement>) => void }
    | undefined
  const confirmClick = confirmProps as
    | { onClick?: (event: MouseEvent<HTMLButtonElement>) => void }
    | undefined

  const handleCancel = (event: MouseEvent<HTMLButtonElement>) => {
    cancelClick?.onClick?.(event)
    onCancel?.()
    if (closeOnCancel) {
      onRequestClose(id)
    }
  }

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    confirmClick?.onClick?.(event)
    onConfirm?.()
    if (closeOnConfirm) {
      onRequestClose(id)
    }
  }

  return (
    <>
      {children ? <Box mb="md">{children}</Box> : null}
      <Group mt={children ? 0 : "md"} justify="flex-end" {...groupProps}>
        <Button
          variant="default"
          {...cancelProps}
          onClick={handleCancel}
          data-skip-close-confirm="true"
        >
          {cancelProps?.children || labels.cancel}
        </Button>
        <Button
          {...confirmProps}
          onClick={handleConfirm}
          data-skip-close-confirm="true"
        >
          {confirmProps?.children || labels.confirm}
        </Button>
      </Group>
    </>
  )
}

export const ConfirmingModalsProvider = ({
  children,
  modalProps,
  labels,
  modals = {}
}: ConfirmingModalsProviderProps) => {
  const [state, dispatch] = useReducer(modalsReducer, {
    current: null,
    modals: []
  })
  const stateRef = useRef(state)
  stateRef.current = state

  const forceCloseModal = useCallback((id: string, canceled?: boolean) => {
    dispatch({ type: "CLOSE", modalId: id, canceled })
  }, [])

  const forceCloseAllModals = useCallback((canceled?: boolean) => {
    dispatch({ type: "CLOSE_ALL", canceled })
  }, [])

  const openModal = useCallback(
    ({ modalId, ...props }: ModalSettings & { children?: ReactNode }) => {
      const id = modalId || randomId()
      dispatch({
        type: "OPEN",
        modal: {
          id,
          type: "content",
          props
        }
      })
      return id
    },
    []
  )

  const openConfirmModal = useCallback(({
    modalId,
    ...props
  }: ConfirmModalSettings) => {
    const id = modalId || randomId()
    dispatch({
      type: "OPEN",
      modal: {
        id,
        type: "confirm",
        props
      }
    })
    return id
  }, [])

  const openContextModal = useCallback(
    (modal: string, { modalId, ...props }: OpenContextModalSettings) => {
      const id = modalId || randomId()
      dispatch({
        type: "OPEN",
        modal: {
          id,
          type: "context",
          ctx: modal,
          props
        }
      })
      return id
    },
    []
  )

  const updateModal = useCallback(
    ({ modalId, ...newProps }: { modalId: string } & Partial<ModalSettings>) => {
      dispatch({ type: "UPDATE", modalId, newProps })
    },
    []
  )

  const updateContextModal = useCallback(
    ({
      modalId,
      ...newProps
    }: { modalId: string } & Partial<OpenContextModalSettings>) => {
      dispatch({ type: "UPDATE", modalId, newProps })
    },
    []
  )

  const openCloseConfirmation = useCallback((targetId: string) => {
    const existing = stateRef.current.modals.find(
      (modal) => modal.type === "close-confirm" && modal.targetId === targetId
    )

    if (existing) {
      return existing.id
    }

    const id = randomId()

    dispatch({
      type: "OPEN",
      modal: {
        id,
        type: "close-confirm",
        targetId,
        props: {
          title: <b>Xác nhận đóng</b>,
          children: "Bạn có chắc chắn muốn đóng cửa sổ này không?",
          labels: DEFAULT_CLOSE_CONFIRM_LABELS,
          skipCloseConfirmation: true
        }
      }
    })

    return id
  }, [])

  const requestCloseModal = useCallback(
    (id?: string) => {
      const targetId = id || stateRef.current.current?.id
      if (!targetId) {
        return
      }

      const modal = stateRef.current.modals.find((item) => item.id === targetId)
      if (!modal) {
        return
      }

      if (
        modal.type === "confirm" ||
        modal.type === "close-confirm" ||
        modal.props.skipCloseConfirmation
      ) {
        forceCloseModal(targetId, true)
        return
      }

      openCloseConfirmation(targetId)
    },
    [forceCloseModal, openCloseConfirmation]
  )

  useConfirmingModalsEvents({
    openModal,
    openConfirmModal,
    openContextModal: ({ modal, ...payload }) => openContextModal(modal, payload),
    closeModal: forceCloseModal,
    closeContextModal: forceCloseModal,
    closeAllModals: forceCloseAllModals,
    updateModal,
    updateContextModal
  })

  const context: ConfirmingModalsContext = {
    modalProps: modalProps || {},
    modals: state.modals,
    openModal,
    openConfirmModal,
    openContextModal,
    closeModal: forceCloseModal,
    closeContextModal: forceCloseModal,
    closeAll: () => forceCloseAllModals(),
    updateModal,
    updateContextModal
  }

  const handleContentClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const currentModal = stateRef.current.current
      if (
        !currentModal ||
        currentModal.type === "confirm" ||
        currentModal.type === "close-confirm"
      ) {
        return
      }

      if (!shouldInterceptDismissButton(event.target as HTMLElement | null)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      requestCloseModal(currentModal.id)
    },
    [requestCloseModal]
  )

  const getCurrentModal = () => {
    const currentModal = stateRef.current.current

    if (!currentModal) {
      return { modalProps: {}, content: null }
    }

    if (currentModal.type === "context") {
      const { innerProps, ...rest } = currentModal.props
      const ContextModal = modals[currentModal.ctx]

      return {
        modalProps: separateBaseModalProps(rest),
        content: ContextModal ? (
          <Box onClickCapture={handleContentClickCapture}>
            <ContextModal
              innerProps={innerProps}
              context={context}
              id={currentModal.id}
            />
          </Box>
        ) : null
      }
    }

    if (currentModal.type === "confirm") {
      const { modalProps: currentModalProps, confirmProps } =
        separateConfirmModalProps(currentModal.props)

      return {
        modalProps: currentModalProps,
        content: (
          <ConfirmModalContent
            {...confirmProps}
            labels={confirmProps.labels || labels}
            id={currentModal.id}
            onRequestClose={requestCloseModal}
          />
        )
      }
    }

    if (currentModal.type === "close-confirm") {
      const { modalProps: currentModalProps, confirmProps } =
        separateConfirmModalProps(currentModal.props)

      return {
        modalProps: currentModalProps,
        content: (
          <ConfirmModalContent
            {...confirmProps}
            id={currentModal.id}
            onRequestClose={forceCloseModal}
            closeOnConfirm={false}
            onConfirm={() => {
              forceCloseModal(currentModal.id)
              forceCloseModal(currentModal.targetId, true)
            }}
          />
        )
      }
    }

    const { children: modalChildren, ...rest } = currentModal.props

    return {
      modalProps: separateBaseModalProps(rest),
      content: (
        <Box onClickCapture={handleContentClickCapture}>{modalChildren}</Box>
      )
    }
  }

  const { modalProps: currentModalProps, content } = getCurrentModal()

  return (
    <>
      <Modal
        zIndex={getDefaultZIndex("modal") + 1}
        {...modalProps}
        {...currentModalProps}
        opened={state.modals.length > 0}
        onClose={() => requestCloseModal()}
      >
        {content}
      </Modal>
      {children}
    </>
  )
}
