import { NextResponse } from "next/server";

export function handleApiError(error: unknown, userMessage = "An unexpected error occurred.") {
  // Log detailed error on server for diagnostics
  console.error("[API_ERROR]", error);

  if (error instanceof Error) {
    if (error.name === "BSONError" || error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid resource identifier format." },
        { status: 400 }
      );
    }
  }

  // Return clean, user-safe error message without leaking stack traces or internal paths
  return NextResponse.json(
    { error: userMessage },
    { status: 500 }
  );
}

export function isValidObjectId(id: string): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}
