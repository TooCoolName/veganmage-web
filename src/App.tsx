import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MagesPage } from './pages/MagesPage';
import { MageDetailsPage } from './pages/MageDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="mages" element={<MagesPage />} />
          <Route path="mages/:id" element={<MageDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
