import { Extension, type Editor } from "@tiptap/core"
import { isValidYoutubeUrl } from "@tiptap/extension-youtube"
import { Plugin, PluginKey } from "@tiptap/pm/state"

// Matches URLs that end with a known image extension (optionally with query string)
const IMAGE_EXT_REGEX = /\.(jpe?g|png|gif|webp|svg|avif|bmp)(\?.*)?$/i

// Matches common image CDN / hosting patterns even when there is no extension
const IMAGE_CDN_REGEX =
  /\/(img|image|images|photo|photos|media|files|upload|uploads|static|assets|cdn)\//i

// Some CDN URLs have image content type hints in the query string
const IMAGE_QS_HINTS = /[?&](format|fmt|ext|type)=(jpe?g|jpg|png|gif|webp|avif)/i

// Node name provided by tiptap-extension-resize-image.
const IMAGE_NODE_NAME = "imageResize"

/**
 * Returns true if the URL looks like an image even without a file extension.
 */
export function looksLikeImage(url: string): boolean {
  if (IMAGE_EXT_REGEX.test(url)) return true
  if (IMAGE_QS_HINTS.test(url)) return true
  if (IMAGE_CDN_REGEX.test(url)) return true
  return false
}

export function extractSingleUrl(text: string | undefined): string | null {
  if (!text) return null
  const trimmed = text.trim()
  if (!trimmed || /\s/.test(trimmed)) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

export function insertImage(editor: Editor, src: string): void {
  editor
    .chain()
    .focus()
    .insertContent({ type: IMAGE_NODE_NAME, attrs: { src } })
    .run()
}

/**
 * Turns a URL into the matching rich node (YouTube embed or image).
 * Returns true when a node was inserted, false when the URL is neither.
 * Shared by the paste handler and the link popover so both behave the same.
 */
export function insertMediaFromUrl(editor: Editor, rawUrl: string): boolean {
  const url = extractSingleUrl(rawUrl)
  if (!url) return false

  if (isValidYoutubeUrl(url)) {
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
    return true
  }

  if (looksLikeImage(url)) {
    insertImage(editor, url)
    return true
  }

  return false
}

/**
 * Async: fetch HEAD and check Content-Type.
 * Used as fallback for ambiguous URLs (no extension, no CDN path hint).
 */
export async function fetchIsImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", mode: "no-cors" })
    const ct = res.headers.get("content-type") ?? ""
    return ct.startsWith("image/")
  } catch {
    return false
  }
}

/**
 * Converts a pasted image or YouTube URL into the matching rich node.
 *
 * Placed first in the extensions array so its ProseMirror plugin is registered
 * before the StarterKit Link plugin, giving it priority in handlePaste.
 */
export const ImagePasteLink = Extension.create({
  name: "imagePasteLink",

  priority: 1000,

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey("imagePasteLink"),
        props: {
          handlePaste: (_view, event) => {
            const url = extractSingleUrl(
              event.clipboardData?.getData("text/plain")
            )
            if (!url) return false

            // YouTube + image URLs that we can classify synchronously.
            if (insertMediaFromUrl(editor, url)) {
              return true
            }

            // Async fallback: HEAD request to check Content-Type. We let the
            // default paste run (URL becomes a link), then replace it with an
            // image node if the request confirms it points at an image.
            fetchIsImage(url).then((isImg) => {
              if (isImg) insertImage(editor, url)
            })

            return false
          },
        },
      }),
    ]
  },
})

export default ImagePasteLink
