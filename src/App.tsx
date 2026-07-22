import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PrivacyPage } from "./pages/extension/PrivacyPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="extension/privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
