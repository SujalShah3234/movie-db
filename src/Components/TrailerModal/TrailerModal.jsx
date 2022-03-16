import { Box, IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import styles from './TrailerModal.module.scss';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: '2px solid background.paper',
  boxShadow: 24,
};

export const TrailerModal = ({ open, handleClose, data }) => {
  return (
    <Modal open={open}>
      <Box sx={modalStyle}>
        <div className={styles['title-bar']}>
          <span className={styles.title}>Play Trailer</span>
          <IconButton size='small' color='inherit' onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <iframe
          src={`https://www.youtube.com/embed/${data.key}?autoplay=1`}
          allow='autoplay'
          allowFullScreen
          width='100%'
          height='100%'
          title='Play Trailer'
          style={{ border: '0' }}
        />
      </Box>
    </Modal>
  );
};