import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MobileFrame } from './components/layout/MobileFrame';
import { useSessionStore } from './store/useSessionStore';
import { Toaster } from 'react-hot-toast';
import { SceneTransition } from './components/layout/SceneTransition';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useSettingsStore } from './store/useSettingsStore';
import { MotionConfig } from 'framer-motion';
import './i18n/config';

const Onboarding = React.lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Login = React.lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Passbook = React.lazy(() => import('./pages/workflows/Passbook').then(m => ({ default: m.Passbook })));
const Claim = React.lazy(() => import('./pages/workflows/Claim').then(m => ({ default: m.Claim })));
const Transfer = React.lazy(() => import('./pages/workflows/Transfer').then(m => ({ default: m.Transfer })));
const UanActivation = React.lazy(() => import('./pages/workflows/UanActivation').then(m => ({ default: m.UanActivation })));
const Grievance = React.lazy(() => import('./pages/workflows/Grievance').then(m => ({ default: m.Grievance })));
const DocumentVault = React.lazy(() => import('./pages/workflows/DocumentVault').then(m => ({ default: m.DocumentVault })));
const SmartFlowEngine = React.lazy(() => import('./pages/workflows/SmartFlowEngine').then(m => ({ default: m.SmartFlowEngine })));
const History = React.lazy(() => import('./pages/workflows/History').then(m => ({ default: m.History })));
const LifeCertificate = React.lazy(() => import('./pages/workflows/LifeCertificate').then(m => ({ default: m.LifeCertificate })));
const MarkExit = React.lazy(() => import('./pages/workflows/MarkExit').then(m => ({ default: m.MarkExit })));
const KycMismatch = React.lazy(() => import('./pages/workflows/KycMismatch').then(m => ({ default: m.KycMismatch })));
const MergeAccounts = React.lazy(() => import('./pages/workflows/MergeAccounts').then(m => ({ default: m.MergeAccounts })));
const Notifications = React.lazy(() => import('./pages/workflows/Notifications').then(m => ({ default: m.Notifications })));
const StatusPage = React.lazy(() => import('./pages/StatusPage').then(m => ({ default: m.StatusPage })));

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

function App() {
  const lowInternetMode = useSettingsStore(s => s.lowInternetMode);

  return (
    <MotionConfig reducedMotion={lowInternetMode ? 'always' : 'user'}>
    <BrowserRouter>
      <MobileFrame>
        <OfflineBanner />
        <OnboardWrapper>
          <SceneTransition>
            <ErrorBoundary>
              <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-epfo-blue border-t-transparent rounded-full" /></div>}>
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
                  <Route path='/status' element={<StatusPage />} />
                  <Route path='/life-certificate' element={<PrivateRoute><LifeCertificate /></PrivateRoute>} />
                  <Route path='/mark-exit' element={<PrivateRoute><MarkExit /></PrivateRoute>} />
                  <Route path='/kyc-mismatch' element={<PrivateRoute><KycMismatch /></PrivateRoute>} />
                  <Route path='/merge-accounts' element={<PrivateRoute><MergeAccounts /></PrivateRoute>} />
                  <Route path='/notifications' element={<PrivateRoute><Notifications /></PrivateRoute>} />
                </Routes>
              </React.Suspense>
            </ErrorBoundary>
          </SceneTransition>
        </OnboardWrapper>
      </MobileFrame>
      <Toaster position="bottom-center" />
    </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
