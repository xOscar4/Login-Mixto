import { type FormEvent, useEffect, useState } from "react";
import {
    BrowserRouter,
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { supabase } from "./lib/supabase";

type CardState = {
  title: string;
  message: string;
  status: "loading" | "success" | "error";
};

function getParams(locationSearch: string) {
  return new URLSearchParams(locationSearch);
}

function Card({ title, message, status }: CardState) {
  return (
    <main className="page-shell">
      <section className="card" data-status={status}>
        <div className="badge">Melody</div>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="actions">
          <Link to="/" className="primary-button">
            Volver a Melody
          </Link>
        </div>
      </section>
    </main>
  );
}

function HomePage() {
  return (
    <main className="page-shell">
      <section className="card">
        <div className="badge">Melody</div>
        <h1>Autenticación web</h1>
        <p>
          Esta página pública gestiona la verificación de correo y la
          recuperación de contraseña de Supabase para Melody.
        </p>
        <div className="actions">
          <Link to="/auth/confirm" className="primary-button">
            Verificar cuenta
          </Link>
          <Link to="/reset-password" className="secondary-button">
            Recuperar contraseña
          </Link>
        </div>
      </section>
    </main>
  );
}

function AuthConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = getParams(location.search);
  const type = params.get("type");
  const [state, setState] = useState<CardState>(() => {
    if (!type) {
      return {
        title: "Falta información",
        message: "No se encontró el tipo de verificación en la URL.",
        status: "error",
      };
    }

    return {
      title: "Comprobando tu acceso…",
      message: "Estamos validando el enlace de verificación de Supabase.",
      status: "loading",
    };
  });

  useEffect(() => {
    const params = getParams(location.search);
    const type = params.get("type");
    const tokenHash = params.get("token_hash");
    const token = params.get("token");

    if (!type) {
      return;
    }

    if (type === "recovery") {
      navigate(`/reset-password${location.search}`, { replace: true });
      return;
    }

    const verify = async () => {
      try {
        const payload: { type: string; token_hash?: string; token?: string } = {
          type,
        };

        if (tokenHash) payload.token_hash = tokenHash;
        if (token) payload.token = token;

        const { error } = await supabase.auth.verifyOtp(payload as never);

        if (error) {
          throw error;
        }

        setState({
          title: "Correo verificado",
          message:
            "Tu cuenta de Melody quedó confirmada correctamente. Ya puedes volver a la app y continuar.",
          status: "success",
        });
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "Inténtalo de nuevo o solicita otra verificación.";

        setState({
          title: "La verificación falló",
          message: description,
          status: "error",
        });
      }
    };

    void verify();
  }, [location.search, navigate, type]);

  return <Card {...state} />;
}

function SuccessPage() {
  return (
    <Card
      title="Todo listo"
      message="La verificación se completó correctamente. Puedes cerrar esta pestaña y volver a la app."
      status="success"
    />
  );
}

function ErrorPage() {
  return (
    <Card
      title="No pudimos continuar"
      message="El enlace no es válido o ya expiró. Solicita una nueva verificación o recuperación de contraseña."
      status="error"
    />
  );
}

function ResetPasswordPage() {
  const location = useLocation();
  const params = getParams(location.search);
  const type = params.get("type");
  const tokenHash = params.get("token_hash");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasVerifiedToken, setHasVerifiedToken] = useState(false);
  const [status, setStatus] = useState<CardState>(() => {
    if (!type || type !== "recovery") {
      return {
        title: "Enlace inválido",
        message: "Este enlace no corresponde a recuperación de contraseña.",
        status: "error",
      };
    }

    if (!tokenHash) {
      return {
        title: "Falta el token",
        message: "El enlace de recuperación no incluye el código necesario.",
        status: "error",
      };
    }

    return {
      title: "Recuperando contraseña",
      message:
        "Validamos el enlace de recuperación antes de cambiar tu contraseña.",
      status: "loading",
    };
  });
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (hasVerifiedToken || !type || type !== "recovery") {
      return;
    }

    if (!tokenHash) {
      return;
    }

    const verify = async () => {
      try {
        if (type !== "recovery") {
          setStatus({
            title: "Enlace inválido",
            message: "Este enlace no corresponde a recuperación de contraseña.",
            status: "error",
          });
          return;
        }

        if (!tokenHash) {
          setStatus({
            title: "Falta el token",
            message:
              "El enlace de recuperación no incluye el código necesario.",
            status: "error",
          });
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });

        if (error) {
          throw error;
        }

        setHasVerifiedToken(true);
        setStatus({
          title: "Crea tu nueva contraseña",
          message:
            "Tu enlace es válido. Elige una nueva contraseña para continuar.",
          status: "success",
        });
        setVerified(true);
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "El enlace de recuperación no es válido o ya expiró.";

        setStatus({
          title: "Error de recuperación",
          message: description,
          status: "error",
        });
      }
    };

    void verify();
  }, [hasVerifiedToken, location.search, tokenHash, type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!verified) {
      return;
    }

    if (password.trim().length < 8) {
      setStatus({
        title: "Contraseña demasiado corta",
        message: "Usa al menos 8 caracteres para continuar.",
        status: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        title: "Las contraseñas no coinciden",
        message:
          "Verifica que la nueva contraseña y su confirmación sean iguales.",
        status: "error",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setStatus({
        title: "Contraseña actualizada",
        message:
          "Tu contraseña ya fue cambiada correctamente. Ya puedes iniciar sesión de nuevo.",
        status: "success",
      });
      setVerified(false);
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la nueva contraseña.";

      setStatus({
        title: "No se pudo actualizar",
        message: description,
        status: "error",
      });
    }
  }

  if (status.status === "loading") {
    return <Card {...status} />;
  }

  if (status.status === "error" && !verified) {
    return <Card {...status} />;
  }

  return (
    <main className="page-shell">
      <section className="card" data-status={status.status}>
        <div className="badge">Melody</div>
        <h1>{status.title}</h1>
        <p>{status.message}</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </label>

          <label>
            <span>Confirmar contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="primary-button">
            Guardar contraseña
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/confirm" element={<AuthConfirmPage />} />
        <Route path="/auth/success" element={<SuccessPage />} />
        <Route path="/auth/error" element={<ErrorPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
