import { Youtube } from "@tiptap/extension-youtube"
import { ReactNodeViewRenderer } from "@tiptap/react"

import { ResizableYoutubeNodeView } from "./resizable-youtube-node-view"

/**
 * The stock Youtube node renders a fixed-size iframe via renderHTML. We extend
 * it with a React node view that adds a drag-to-resize handle, while keeping the
 * original parse/serialize behaviour so saved content (width/height attributes)
 * round-trips correctly.
 */
export const ResizableYoutube = Youtube.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ResizableYoutubeNodeView)
  },
})

export default ResizableYoutube
