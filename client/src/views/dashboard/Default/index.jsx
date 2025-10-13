import Grid from '@mui/material/Grid2';
import HeroBrandCard from './HeroBrandCard';

export default function Dashboard() {
  return (
    <Grid container spacing={0} sx={{ px: { xs: 0, md: 0 } }}>
      <Grid size={12}>
        <HeroBrandCard />
      </Grid>
    </Grid>
  );
}
