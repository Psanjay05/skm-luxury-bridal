import { NextResponse } from "next/server";

export function handleApiError(error: unknown, userMessage = "An unexpected error occurred.") {
  const errorMessage = error instanceof Error ? error.message : String(error);
  // Log detailed error on server for diagnostics
  console.error("[API_ERROR]", {
    userMessage,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof Error) {
    if (error.name === "BSONError" || error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid resource identifier format.", details: errorMessage },
        { status: 400 }
      );
    }
  }

  // Return formatted error message with server diagnostics surfaced clearly
  return NextResponse.json(
    {
      success: false,
      error: userMessage,
      details: errorMessage,
    },
    { status: 500 }
  );
}

export function isValidObjectId(id: string): boolean {
  return typeof id === "string" && (/^[0-9a-fA-F]{24}$/.test(id) || /^[a-zA-Z0-9_-]{1,64}$/.test(id));
}
