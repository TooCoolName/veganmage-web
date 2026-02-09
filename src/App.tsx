import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MagesPage } from './pages/MagesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mages" element={<MagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
