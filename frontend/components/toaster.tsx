"use client";

import { Snackbar, Alert } from "@mui/material";
import { useToast } from "@/hoooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map(({ id, title, description, action, open = true }) => (
        <Snackbar
          key={id}
          open={open}
          autoHideDuration={4000}
          onClose={() => dismiss(id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => dismiss(id)}
            severity="info"
            sx={{ width: "100%" }}
            action={action}
          >
            {title && <strong>{title}</strong>}
            {description && <div>{description}</div>}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
