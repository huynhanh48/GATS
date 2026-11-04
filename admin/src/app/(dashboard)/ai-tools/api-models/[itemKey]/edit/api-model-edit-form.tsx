"use client";

import type { AiToolConfig } from "../../../actions";
import { ApiProviderForm } from "../../_components/api-provider-form";

export function ApiModelEditForm({ initialItem }: { initialItem: AiToolConfig }) {
  return <ApiProviderForm initialItem={initialItem} />;
}
