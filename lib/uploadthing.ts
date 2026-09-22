"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { NuestroFileRouter } from "@/app/api/uploadthing/core";

// Helpers de cliente tipados con el File Router. La importación del tipo es
// type-only, por lo que no arrastra código de servidor al bundle del cliente.
export const { useUploadThing } = generateReactHelpers<NuestroFileRouter>();
