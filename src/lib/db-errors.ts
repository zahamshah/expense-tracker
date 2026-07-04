export function isDatabaseSetupError(error: unknown) {
  const code = getErrorCode(error);

  return (
    code === "P1000" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1003" ||
    code === "P1010" ||
    code === "P2021" ||
    code === "P2022" ||
    getErrorMessage(error).includes("Can't reach database server")
  );
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "";
}
