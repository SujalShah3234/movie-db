import { Backdrop, CircularProgress } from '@mui/material';

export const Spinner = () => (
  <Backdrop
    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={true}
  >
    <CircularProgress color='primary' variant='indeterminate' />
  </Backdrop>
);