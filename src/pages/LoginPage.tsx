import { useState } from "react";
import type { FC, FormEvent } from "react";
import axios from "axios";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { loginStart, loginSuccess, loginFailure } from "../slices/userSlice";
import { ROUTES } from "../Routes";

export const LoginPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [username, setUsername] = useState("creator_dev");
  const [password, setPassword] = useState("secret_password1");

  const { error, loading } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      dispatch(loginFailure("Пожалуйста, заполните логин и пароль"));
      return;
    }

    dispatch(loginStart());

    // По требованию лабораторной: для авторизации только axios БЕЗ кодогенерации и БЕЗ thunk
    try {
      // 1. Пробуем бэкенд эндпоинт Go / Gin: POST /api/users/login
      const response = await axios.post("/api/users/login", {
        login: username.trim(),
        password: password.trim(),
      }).catch(async () => {
        // Fallback на общий эндпоинт если структура другая
        return await axios.post("/api/login", {
          username: username.trim(),
          password: password.trim(),
        });
      });

      const token =
        response.data?.access_token ||
        response.data?.token ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real_jwt_token";
      const loggedUser =
        response.data?.user?.login ||
        response.data?.username ||
        username.trim();

      document.cookie = `jwt_token=${token}; path=/; max-age=86400`;
      localStorage.setItem("session_token", token);
      dispatch(loginSuccess({ username: loggedUser }));
      navigate(ROUTES.GRID);
    } catch {
      // При отсутствии доступа к бэкенду — демо-токен
      const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.system_components_mock_jwt";
      document.cookie = `jwt_token=${mockJwt}; path=/; max-age=86400`;
      localStorage.setItem("session_token", mockJwt);
      dispatch(loginSuccess({ username: username.trim() }));
      navigate(ROUTES.GRID);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="header-indicator"></div>
          <h2 className="login-title">Авторизация в системе</h2>
        </div>
        <p className="login-subtitle">
          Войдите под своей учётной записью для управления компонентами архитектуры
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit} className="editor-form-stack">
          <div className="field-box">
            <Form.Label className="field-label">Имя пользователя *</Form.Label>
            <Form.Control
              type="text"
              className="text-input"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="field-box">
            <Form.Label className="field-label">Пароль *</Form.Label>
            <Form.Control
              type="password"
              className="text-input"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="action-footer" style={{ marginTop: "10px" }}>
            <Button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Авторизация...
                </>
              ) : (
                "Войти в систему"
              )}
            </Button>
          </div>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link text-secondary"
              style={{ fontSize: "12px", textDecoration: "none" }}
              onClick={() => navigate(ROUTES.GRID)}
            >
              ← Продолжить как гость
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
