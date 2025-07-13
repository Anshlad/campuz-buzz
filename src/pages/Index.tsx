
import { Routes, Route } from "react-router-dom";
import { EnhancedAppLayout } from "@/components/layout/EnhancedAppLayout";

const Index = () => {
  return (
    <Routes>
      <Route path="/*" element={<EnhancedAppLayout />} />
    </Routes>
  );
};

export default Index;
