import { useEffect, useRef, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import type { IToastProps } from '@/interfaces'
import { ToastContainerWrapper } from './container-toast.styled'
import { ContentWrapper, IconWrapper } from './styled'
import { Title } from './title.styled'
import { Description } from './description.styled'
import { CloseButton } from './button.styled'

const TOAST_ICONS = {
  success: <CheckCircle color="#22c55e" />,
  error: <AlertCircle color="#ef4444" />,
  info: <Info color="#3b82f6" />,
  warning: <AlertTriangle color="#f59e0b" />,
  default: <Info color="#6b7280" />,
}

function isVertical(position: string): boolean {
  return position === 'top-center' || position === 'bottom-center'
}

function getInitialOffset(position: string): number {
  switch (position) {
    case 'top-left':
    case 'bottom-left':
      return -16
    case 'top-right':
    case 'bottom-right':
      return 16
    case 'top-center':
      return -16
    case 'bottom-center':
      return 16
    default:
      return 0
  }
}

export const ContainerToast: React.FC<
  IToastProps & { onRemove: () => void }
> = ({
  title,
  description,
  type = 'default',
  closeOnClick = true,
  draggable = true,
  onRemove,
  position = 'top-right',
}: {
  title?: string
  description?: React.ReactNode
  type?: 'success' | 'error' | 'info' | 'warning' | 'default'
  closeOnClick?: boolean
  draggable?: boolean
  onRemove: () => void
  position?: string
}) => {
  const toastRef = useRef<HTMLDivElement>(null)
  const vertical = isVertical(position)
  const initialOffset = getInitialOffset(position)

  const [isDragging, setIsDragging] = useState(false)
  const [drag, setDrag] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [entered, setEntered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const dragStart = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setEntered(true)
      setOpacity(1)
    }, 10)
    return () => clearTimeout(t)
  }, [])

  const triggerRemove = () => {
    if (isExiting) return
    setIsExiting(true)

    setOpacity(0)

    let dragValue = 0
    if (vertical) {
      dragValue = position.includes('top') ? -100 : 100
    } else {
      dragValue = position.includes('left') ? -100 : 100
    }
    setDrag(dragValue)

    const exitTimer = setTimeout(() => {
      onRemove()
    }, 300)

    return () => clearTimeout(exitTimer)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return
    dragStart.current = vertical ? e.clientY - drag : e.clientX - drag
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const current = vertical ? e.clientY : e.clientX
    const offset = current - dragStart.current
    setDrag(offset)

    if (Math.abs(offset) > 100) {
      setOpacity(Math.max(0, 1 - (Math.abs(offset) - 100) / 100))
    } else {
      setOpacity(1)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (Math.abs(drag) > 150) {
      triggerRemove()
    } else {
      setDrag(0)
      setOpacity(1)
    }
  }

  const handleClick = () => {
    if (closeOnClick) {
      triggerRemove()
    }
  }

  const translateValue = entered ? drag : initialOffset
  const transform = vertical
    ? `translateY(${translateValue}px)`
    : `translateX(${translateValue}px)`

  return (
    <ToastContainerWrapper
      ref={toastRef}
      $type={type}
      $isDragging={isDragging}
      $draggable={draggable}
      $transform={transform}
      $opacity={opacity}
      $isDraggingNow={isDragging}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-hidden
    >
      <IconWrapper>{TOAST_ICONS[type]}</IconWrapper>
      <ContentWrapper>
        {title && <Title>{title}</Title>}
        {description && <Description>{description}</Description>}
      </ContentWrapper>
      <CloseButton
        $type={type}
        onClick={(e) => {
          e.stopPropagation()
          triggerRemove()
        }}
      >
        <X className="h-4 w-4" />
      </CloseButton>
    </ToastContainerWrapper>
  )
}
