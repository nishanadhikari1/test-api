import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage/>}/>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>Home placeholder</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
