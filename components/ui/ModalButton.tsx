import React, { useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

type ModalButtonProps = {
  button: React.ReactElement;
  Form: React.ComponentType<any>;
  onSave: () => void;
  onCancel: () => void;
};

const ModalButton: React.FC<ModalButtonProps> = ({ button, Form, onSave, onCancel }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (button.props.onClick) {
      button.props.onClick();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    handleClose();
  };

  const handleCancel = () => {
    onCancel();
    handleClose();
  };

  const buttonWithOnClick = React.cloneElement(button, {
    onClick: handleOpen,
  });

  const formDetails = useRef();

  return (
    <>
      {buttonWithOnClick}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Modal Title</DialogTitle>
        <DialogContent>
          <Form ref={formDetails}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalButton;
