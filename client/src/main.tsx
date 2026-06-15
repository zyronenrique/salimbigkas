import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/authContext.tsx";
import { LogRegProvider } from "./components/Modals/LogRegProvider.tsx";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import { UsersProvider } from "./hooks/usersContext.tsx";
import { ClassProvider } from "./hooks/classContext.tsx";
import { SeatworkQuizProvider } from "./hooks/seatworkQuizContext.tsx";
import { BigkasProvider } from "./hooks/bigkasContext.tsx";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.tsx";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'overlayscrollbars/overlayscrollbars.css';
import { JoyrideStepProvider } from "./hooks/joyrideContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkeletonTheme baseColor="#E0E0E0" highlightColor="#F0F0F0">
      <HelmetProvider>
        <BrowserRouter basename="/">
          <AuthProvider>
            <JoyrideStepProvider>
              <UsersProvider>
                <LogRegProvider>
                  <ClassProvider>
                    <SeatworkQuizProvider>
                      <BigkasProvider>
                        <OverlayScrollbarsComponent
                          options={{ scrollbars: { autoHide: "leave" } }}
                          defer
                          className="h-screen w-screen"
                        >
                          <App />
                          <ToastContainer
                            position="top-center"
                            autoClose={5000}
                            hideProgressBar={true}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                            limit={4}
                          />
                        </OverlayScrollbarsComponent>
                      </BigkasProvider>
                    </SeatworkQuizProvider>
                  </ClassProvider>
                </LogRegProvider>
              </UsersProvider>
            </JoyrideStepProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </SkeletonTheme>
  </StrictMode>,
);
