import React, { useEffect, useState } from "react";
import { Button, Input } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/hooks/useWdrRouter";
import { useTranslation } from "@/hooks/useTranslation";
import "./LoginPage.css";

export const LoginPage: React.FC = () => {
    const { navigate } = useRouter();
    const { login, currentUser } = useUser();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        if (currentUser.role === "PARTNER") {
            navigate({ name: "partner-dashboard" });
        } else if (currentUser.role === "ADMIN") {
            navigate({ name: "admin-dashboard" });
        } else {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    if (currentUser) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError(t("auth.login.error.required"));
            return;
        }

        setIsLoading(true);
        const success = await login(email.trim().toLowerCase(), password);
        setIsLoading(false);

        if (!success) {
            setError(t("auth.login.error.invalid"));
        }
    };

    const eyeIcon = (
        <button
            type="button"
            className="wdr-login__eye-btn"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
                showPassword ? t("auth.password.hide") : t("auth.password.show")
            }
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {showPassword ? (
                    <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                ) : (
                    <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </>
                )}
            </svg>
        </button>
    );

    return (
        <div className="wdr-login">
            <div className="wdr-login__card">
                <div className="wdr-login__header">
                    <h1 className="wdr-login__title">
                        {t("auth.login.title")}
                    </h1>
                    <p className="wdr-login__subtitle">
                        {t("auth.login.subtitle")}
                    </p>
                </div>

                <form
                    className="wdr-login__form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <Input
                        label={t("auth.login.email")}
                        type="email"
                        placeholder={t("auth.login.email_placeholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <Input
                        label={t("auth.login.password")}
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.login.password_placeholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        rightIcon={eyeIcon}
                        error={error || undefined}
                    />

                    <button
                        type="button"
                        className="wdr-login__forgot"
                        onClick={() => navigate({ name: "forgot-password" })}
                    >
                        {t("auth.login.forgot")}
                    </button>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                    >
                        {t("auth.login.submit")}
                    </Button>
                </form>

                <div className="wdr-login__footer">
                    <p className="wdr-login__register-text">
                        {t("auth.login.no_account")}{" "}
                        <button
                            type="button"
                            className="wdr-login__link"
                            onClick={() => navigate({ name: "register" })}
                        >
                            {t("auth.login.create_account")}
                        </button>
                    </p>
                    <p className="wdr-login__register-text">
                        {t("auth.login.partner_prompt")}{" "}
                        <button
                            type="button"
                            className="wdr-login__link"
                            onClick={() =>
                                navigate({ name: "partner-register" })
                            }
                        >
                            {t("auth.login.partner_cta")}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
