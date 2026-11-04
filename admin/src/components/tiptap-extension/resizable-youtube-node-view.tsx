"use client"

import * as React from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { getEmbedUrlFromYoutubeUrl } from "@tiptap/extension-youtube"

const MIN_WIDTH = 200
const MAX_WIDTH = 1280
const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 480

/**
 * React node view that renders a YouTube embed with a drag handle so the
 * frame can be resized, mirroring the image resize UX.
 */
export function ResizableYoutubeNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected, extension, editor } = props

  const src = (node.attrs.src as string) ?? ""
  const width = Number(node.attrs.width) || DEFAULT_WIDTH
  const height = Number(node.attrs.height) || DEFAULT_HEIGHT
  const start = Number(node.attrs.start) || 0

  const options = extension.options as {
    controls: boolean
    nocookie: boolean
    allowFullscreen: boolean
    autoplay: boolean
    ccLanguage?: string
    ccLoadPolicy?: boolean
    disableKBcontrols: boolean
    enableIFrameApi: boolean
    ivLoadPolicy: number
    interfaceLanguage?: string
    loop: boolean
    modestBranding: boolean
    origin: string
    playlist: string
    progressBarColor?: string
    rel: number
  }

  const embedUrl = getEmbedUrlFromYoutubeUrl({
    url: src,
    allowFullscreen: options.allowFullscreen,
    autoplay: options.autoplay,
    ccLanguage: options.ccLanguage,
    ccLoadPolicy: options.ccLoadPolicy,
    controls: options.controls,
    disableKBcontrols: options.disableKBcontrols,
    enableIFrameApi: options.enableIFrameApi,
    interfaceLanguage: options.interfaceLanguage,
    ivLoadPolicy: options.ivLoadPolicy,
    loop: options.loop,
    modestBranding: options.modestBranding,
    nocookie: options.nocookie,
    origin: options.origin,
    playlist: options.playlist,
    progressBarColor: options.progressBarColor,
    rel: options.rel,
    startAt: start,
  })

  const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!editor.isEditable) return

    const startX = event.clientX
    const startWidth = width
    const aspectRatio = width / height || DEFAULT_WIDTH / DEFAULT_HEIGHT

    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX
      const nextWidth = Math.round(
        Math.min(Math.max(startWidth + delta, MIN_WIDTH), MAX_WIDTH)
      )
      const nextHeight = Math.round(nextWidth / aspectRatio)
      updateAttributes({ width: nextWidth, height: nextHeight })
    }

    const onUp = () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
  }

  return (
    <NodeViewWrapper
      className="resizable-youtube"
      data-selected={selected ? "true" : undefined}
      data-drag-handle
    >
      <div
        className="resizable-youtube__frame"
        style={{
          width,
          maxWidth: "100%",
          aspectRatio: `${width} / ${height}`,
        }}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // Keep the iframe passive inside the editor so clicks select the
            // node (and let the resize handle receive the drag) instead of
            // being swallowed by the embedded player. Playback happens on the
            // published page, not while editing.
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <div className="resizable-youtube__placeholder">Invalid YouTube URL</div>
        )}

        {selected && editor.isEditable ? (
          <span
            className="resizable-youtube__handle"
            onPointerDown={handlePointerDown}
            role="presentation"
          />
        ) : null}
      </div>
    </NodeViewWrapper>
  )
}

export default ResizableYoutubeNodeView
