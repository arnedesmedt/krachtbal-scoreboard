import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import ControlApp from './components/control/ControlWindow';
import PresentationApp from './components/presentation/PresentationWindow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ControlApp />} />
        <Route path="/presentation" element={<PresentationApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

