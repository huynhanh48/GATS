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

import { handleImageUpload } from "@/lib/tiptap-utils"

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
            let imageFiles: File[] = []
            
            // Try reading from files
            if (event.clipboardData?.files?.length) {
              imageFiles = Array.from(event.clipboardData.files).filter(f => f.type.startsWith("image/"))
            }

            // Fallback to items if files is empty (some browsers/copy methods)
            if (imageFiles.length === 0 && event.clipboardData?.items) {
              const items = event.clipboardData.items
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                  const file = items[i].getAsFile()
                  if (file) imageFiles.push(file)
                }
              }
            }

            // Also check for base64 images in HTML
            if (imageFiles.length === 0 && event.clipboardData) {
              const html = event.clipboardData.getData("text/html")
              if (html) {
                const match = html.match(/<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/i)
                if (match) {
                  const mime = `image/${match[1]}`
                  const b64Data = match[2]
                  try {
                    const byteCharacters = atob(b64Data)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const file = new File([byteArray], `pasted-image.${match[1]}`, { type: mime })
                    imageFiles.push(file)
                  } catch (e) {
                    console.error("Failed to parse base64 image", e)
                  }
                }
              }
            }

            if (imageFiles.length > 0) {
              // Clone files immediately into memory before the paste event finishes.
              // Some browsers/environments detach clipboard Blobs once the event handler returns.
              Promise.all(
                imageFiles.map(async (file) => {
                  try {
                    const buffer = await file.arrayBuffer()
                    return new File([buffer], file.name || "pasted-image.png", { type: file.type })
                  } catch (err) {
                    console.error("Failed to clone pasted file", err)
                    return file // fallback to original if cloning fails
                  }
                })
              ).then((clonedFiles) => {
                Promise.all(clonedFiles.map(f => handleImageUpload(f)))
                  .then(urls => {
                    urls.forEach(url => {
                      if (url) insertImage(editor, url)
                    })
                  })
                  .catch(err => console.error("Paste image upload failed", err))
              })

              return true // Prevent default paste behavior
            }

            const url = extractSingleUrl(
              event.clipboardData?.getData("text/plain")
            )
            if (!url) return false

            // YouTube + image URLs that we can classify synchronously.
            // Note: If it's a ChatGPT URL, it might not look like an image to regex
            // but we can't upload it due to CORS anyway, so hotlinking is the only fallback.
            if (insertMediaFromUrl(editor, url) || url.includes("oaiusercontent.com")) {
              if (url.includes("oaiusercontent.com")) {
                // Force insert for chatgpt urls since we can't fetch HEAD
                insertImage(editor, url)
              }
              return true
            }

            // Async fallback: HEAD request to check Content-Type.
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
