import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MobileFrame } from './components/layout/MobileFrame';
import { useSessionStore } from './store/useSessionStore';
import { Login } from './pages/auth/Login';
import { Home } from './pages/Home';
import { Passbook } from './pages/workflows/Passbook';
import { Claim } from './pages/workflows/Claim';
import { Transfer } from './pages/workflows/Transfer';
import { UanActivation } from './pages/workflows/UanActivation';
import { Grievance } from './pages/workflows/Grievance';
import { DocumentVault } from './pages/workflows/DocumentVault';
import { SmartFlowEngine } from './pages/workflows/SmartFlowEngine';
import { History } from './pages/workflows/History';
import { Onboarding } from './pages/Onboarding';
import { LifeCertificate } from './pages/workflows/LifeCertificate';
import { MarkExit } from './pages/workflows/MarkExit';
import { ServerStatus } from './pages/ServerStatus';
import { Toaster } from 'react-hot-toast';
import './i18n/config';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSessionStore();
  return isAuthenticated ? <>{children}</> : <Navigate to='/onboarding' />;
};

const OnboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const onboarded = localStorage.getItem('onboarded');
  const location = useLocation();
  
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to='/onboarding' />;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const { isAuthenticated } = useSessionStore();
  return isAuthenticated ? <Home /> : <Navigate to='/onboarding' replace />;
};

import { SceneTransition } from './components/layout/SceneTransition';

function App() {
  return (
    <BrowserRouter>
      <MobileFrame>
        <OnboardWrapper>
          <SceneTransition>
            <Routes>

              <Route path='/onboarding' element={<Onboarding />} />
              <Route path='/login' element={<Login />} />
              <Route path='/uan-activation' element={<UanActivation />} />
              <Route path='/' element={<RootRedirect />} />
              <Route path='/guest' element={<Home />} />
              <Route path='/passbook' element={<PrivateRoute><Passbook /></PrivateRoute>} />
              <Route path='/claim' element={<PrivateRoute><Claim /></PrivateRoute>} />
              <Route path='/transfer' element={<PrivateRoute><Transfer /></PrivateRoute>} />
              <Route path='/documents' element={<PrivateRoute><DocumentVault /></PrivateRoute>} />
              <Route path='/smart-flow' element={<PrivateRoute><SmartFlowEngine /></PrivateRoute>} />
              <Route path='/history' element={<PrivateRoute><History /></PrivateRoute>} />
              <Route path='/grievance' element={<Grievance />} />
              <Route path='/life-certificate' element={<PrivateRoute><LifeCertificate /></PrivateRoute>} />
              <Route path='/mark-exit' element={<PrivateRoute><MarkExit /></PrivateRoute>} />
              <Route path='/server-status' element={<ServerStatus />} />
            </Routes>
          </SceneTransition>
        </OnboardWrapper>
      </MobileFrame>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}

export default App;
