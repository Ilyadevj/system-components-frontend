import { useState } from "react";
import type { FC, FormEvent } from "react";
import axios from "axios";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { loginStart, loginSuccess, loginFailure } from "../slices/userSlice";
import { isMockMode } from "../modules/dataMode";
import { ROUTES } from "../Routes";

export const LoginPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { error, loading } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      dispatch(loginFailure("Пожалуйста, заполните логин и пароль"));
      return;
    }

    dispatch(loginStart());

    try {
      const login = username.trim();
      if (!isMockMode) {
        await axios.post("/api/users/login", { login, password });
      }
      dispatch(loginSuccess({ username: login }));
      navigate(ROUTES.GRID);
    } catch (error) {
      dispatch(loginFailure(
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Неверный логин или пароль"
          : "Не удалось войти. Проверьте подключение к серверу."
      ));
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
