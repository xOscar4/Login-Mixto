import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { FormNotice } from "@/components/ui/form-notice";
import { Screen } from "@/components/ui/screen";
import { supabase } from "@/lib/supabase";
import { exchangeCodeForSessionOnce } from "@/services/auth";

// Cierra la ventana emergente de OAuth en web. En nativo no hace nada.
WebBrowser.maybeCompleteAuthSession();

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackRoute() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
    token_hash?: string;
    type?: string;
  }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Validando el enlace de acceso...");

  useEffect(() => {
    const code = firstValue(params.code);
    const authError = firstValue(params.error);
    const authDescription = firstValue(params.error_description);
    const tokenHash = firstValue(params.token_hash);
    const type = firstValue(params.type);

    async function handleAuthCallback() {
      if (authError) {
        setStatus("error");
        setMessage(
          authDescription ?? "No se pudo completar la autenticación.",
        );
        return;
      }

      if (code) {
        setMessage("Completando el inicio de sesión...");

        try {
          await exchangeCodeForSessionOnce(code);
          setStatus("success");
          setMessage("Sesión iniciada. Redirigiendo al inicio...");
          router.replace("/home");
        } catch (error) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudo completar el inicio de sesión.",
          );
        }

        return;
      }

      if (!tokenHash || !type) {
        setStatus("error");
        setMessage("No se recibió un enlace válido para continuar.");
        return;
      }

      try {
        if (type === "recovery") {
          router.replace(
            `/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`,
          );
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          type: type as "email" | "signup",
          token_hash: tokenHash,
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        setStatus("success");
        setMessage(
          "Tu correo ha quedado verificado. Redirigiendo al inicio...",
        );
        router.replace("/home");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "No se pudo validar el enlace.",
        );
      }
    }

    void handleAuthCallback();
  }, [
    params.code,
    params.error,
    params.error_description,
    params.token_hash,
    params.type,
  ]);

  return (
    <Screen scroll contentClassName="justify-center">
      <View className="gap-4 rounded-3xl border border-border bg-card/80 p-6 card-shadow">
        <AppText variant="heading">Verificación de acceso</AppText>
        <FormNotice
          tone={
            status === "success"
              ? "success"
              : status === "error"
                ? "danger"
                : "info"
          }
          title={
            status === "success"
              ? "Confirmado"
              : status === "error"
                ? "No se pudo validar"
                : "Comprobando enlace"
          }
          message={message}
        />
      </View>
    </Screen>
  );
}
