import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

export function handleApiError(error: unknown, userMessage = "An unexpected error occurred.") {
  const errorMessage = error instanceof Error ? error.message : String(error);
  // Log detailed error on server for diagnostics — never exposed to client in production
  console.error("[API_ERROR]", {
    userMessage,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof Error) {
    if (error.name === "BSONError" || error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid resource identifier format.",
          // SKM-005 FIX: Only expose internal details in development
          ...(isDev && { details: errorMessage }),
        },
        { status: 400 }
      );
    }
  }

  // SKM-005 FIX: Never expose internal error details in production
  return NextResponse.json(
    {
      success: false,
      error: userMessage,
      ...(isDev && { details: errorMessage }),
    },
    { status: 500 }
  );
}

export function isValidObjectId(id: string): boolean {
  return typeof id === "string" && (/^[0-9a-fA-F]{24}$/.test(id) || /^[a-zA-Z0-9_-]{1,64}$/.test(id));
}
