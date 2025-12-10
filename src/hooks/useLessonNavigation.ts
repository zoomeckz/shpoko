import { useNavigate, useLocation } from "react-router-dom";

export const useLessonNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const returnTo = location.state?.returnCategory;
    if (returnTo) {
      navigate("/", { state: { selectedCategory: returnTo } });
    } else {
      navigate("/");
    }
  };

  return { handleBack, navigate, location };
};
