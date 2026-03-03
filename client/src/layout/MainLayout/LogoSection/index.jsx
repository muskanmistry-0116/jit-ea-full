import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

// project imports
import { DASHBOARD_PATH } from 'config';
import Logo from 'ui-component/Logo';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo">
      {/* <Logo /> */}
       <img src="https://img.freepik.com/premium-vector/modern-energy-logo-design-solution-positive_23729-1676.jpg" alt="" srcset=""height={'80px'} width={'200px'} /> 
    </Link>
  );
}
