import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceLayout from "./components/ServiceLayout";
import ScrollToTop from "./components/ScrollToTop";
import Diving from "./pages/Diving";
import DivingOrder from "./pages/DivingOrder";
import Training from "./pages/Training";
import TrainingFAQ from "./pages/TrainingFAQ";
import Deliveries from "./pages/Deliveries";
import Detailing from "./pages/Detailing";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<ServiceLayout />}>
          <Route path="/diving" element={<Diving />} />
          <Route path="/diving/calculator" element={<Diving />} />
          <Route path="/diving/order" element={<DivingOrder />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/faq" element={<TrainingFAQ />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/detailing" element={<Detailing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
