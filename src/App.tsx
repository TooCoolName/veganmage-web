import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PrivacyPage } from "./pages/extension/PrivacyPage";
import { HomePage } from "./pages/HomePage";
import veganMagePrivacyPolicy from "./content/veganmage/privacy.md?raw";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="veganmage/privacy"
            element={
              <PrivacyPage privacyPolicy={veganMagePrivacyPolicy} productName="Vegan Mage" />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
