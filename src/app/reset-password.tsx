import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { FormNotice } from "@/components/ui/form-notice";
import { Screen } from "@/components/ui/screen";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordRoute() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Verificando el enlace de recuperación...",
  );

  useEffect(() => {
    const tokenHash = Array.isArray(params.token_hash)
      ? params.token_hash[0]
      : params.token_hash;
    const type = Array.isArray(params.type) ? params.type[0] : params.type;

    async function handleRecovery() {
      if (!tokenHash || !type) {
        setStatus("error");
        setMessage(
          "No se recibió un enlace válido para restablecer la contraseña.",
        );
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          type: type as "recovery" | "email" | "signup",
          token_hash: tokenHash,
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        setStatus("success");
        setMessage("Tu enlace es válido. Puedes cambiar la contraseña ahora.");
        router.replace("/settings/change-password");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "No se pudo validar el enlace.",
        );
      }
    }

    void handleRecovery();
  }, [params.token_hash, params.type]);

  return (
    <Screen scroll contentClassName="justify-center">
      <View className="gap-4 rounded-3xl border border-border bg-card/80 p-6 card-shadow">
        <AppText variant="heading">Recuperación de acceso</AppText>
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
              ? "Enlace válido"
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
