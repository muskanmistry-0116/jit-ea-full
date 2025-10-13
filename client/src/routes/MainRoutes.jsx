import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Canvas2Page from '../views/canvas2';
import HistoricalPage from '../views/historical/HistoricalPage';
import { LLVoltagePage } from '../views/telemetry/llVoltage';
import TelemetryPage from '../views/telemetry-kit/TelemetryPage';
import { path } from 'd3';
import AlertLogPage from '../views/alerts/alertLogPage/AlertLogPage';
import EBW from '../views/ebw';
import EBWPage from '../views/ebw';
import PlantSummaryPage from '../views/plantSummary';
import TotalPages from '../views/total_pages';
import TimeWindowDemo from '../menu-items/DatePackage2/TimeWindowDemo';
import RTCostPage from '../views/realtime-layout/RT-Cost';
import PlantInfoPage from '../views/device-properties/forms/plant-info/PlantInfoPage';
import HomePage from '../views/home-page/HomePage';

// dashboard routing
const CanvasPage = Loadable(lazy(() => import('views/canvas/index.jsx')));
const Canvas2 = Loadable(lazy(() => import('views/canvas2/index.jsx')));
const RealtimeLayoutPage = Loadable(lazy(() => import('views/realtime-layout')));
const RealtimeLayoutPage2 = Loadable(lazy(() => import('views/realtime-layout2')));
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const Dashboard2 = Loadable(lazy(() => import('views/dashboard/Default')));
const Alerts = Loadable(lazy(() => import('views/alerts')));
const AiInsights = Loadable(lazy(() => import('views/ai-insights')));
const Reports = Loadable(lazy(() => import('views/reports')));
const Settings = Loadable(lazy(() => import('views/settings')));
const Connectivity = Loadable(lazy(() => import('views/connectivity')));
const Plans = Loadable(lazy(() => import('views/plans')));
const Help = Loadable(lazy(() => import('views/help')));
const MyProfile = Loadable(lazy(() => import('views/my-profile')));
const Users = Loadable(lazy(() => import('views/users')));
const ScheduleMeet = Loadable(lazy(() => import('views/schedule-meeting')));

const MonitoringDetails = Loadable(lazy(() => import('views/monitoring-details')));
const MonitoringDetailsHistory = Loadable(lazy(() => import('views/monitoring-details-history')));

const UserRoles = Loadable(lazy(() => import('views/user-roles')));
const DevicePropertiesPage = Loadable(lazy(() => import('views/device-properties')));
const PlantSummaryDashboard = Loadable(lazy(() => import('views/plantSummary/Dashboard.jsx')));

// Electricity Bill
const ElectricityBill = Loadable(lazy(() => import('views/electricity/BillWizard')));
const BillsOverview = Loadable(lazy(() => import('views/electricity/BillsOverview')));
const BillDetails = Loadable(lazy(() => import('views/electricity/BillDetails')));

// Icons
const Icons = Loadable(lazy(() => import('views/device-properties/forms/components/Icons')))

// 404 page
const NotFound = Loadable(lazy(() => import('views/error_pages/Error-404')));


// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Dashboard2 />
    },

    {
      path: '/dashboard',
      element: <Dashboard2 />
    },

    { path: 'settings', element: <Settings /> },

    { path: 'help', element: <Help /> },
    { path: 'my-profile', element: <MyProfile /> },

    {
      path: '/canvas2',
      element: <Canvas2Page />
    },
    {
      path: '/canvas2/device-properties',
      element: <DevicePropertiesPage />
    },

    {
      path: '/realtime-dashboard2',
      element: <RealtimeLayoutPage2 />
    },

    {

      path: '/icons',
      element: <Icons />
    },
    {
      path: '/home-page',
      element: <HomePage />
    },
    {
      path: '*',
      element: <NotFound />
    },
  ]
};

export default MainRoutes;
