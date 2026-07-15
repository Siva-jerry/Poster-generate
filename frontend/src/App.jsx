import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import TemplatesPage from "./pages/TemplatesPage";
import EditorPage from "./pages/EditorPage";
import MyDesignsPage from "./pages/MyDesignsPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

function App() {
  const location = useLocation();

  const isEditorPage =
    location.pathname.startsWith(
      "/editor"
    );

  return (
    <div className="app">
      {!isEditorPage && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/create"
          element={<CreatePage />}
        />

        <Route
          path="/templates"
          element={<TemplatesPage />}
        />

        <Route
          path="/editor"
          element={<EditorPage />}
        />

        <Route
          path="/editor/:designId"
          element={<EditorPage />}
        />

        <Route
          path="/my-designs"
          element={<MyDesignsPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>

      {!isEditorPage && <Footer />}
    </div>
  );
}

export default App;