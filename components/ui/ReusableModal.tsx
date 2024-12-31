import { Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, IconButton, DialogContent } from "@mui/material";
import { blue } from "@mui/material/colors";
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from "react";

export interface SimpleDialogProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
  }
  
 export default function ReusableModal(props: SimpleDialogProps) {
    const { children, icon } = props;
    const [open, setOpen] = React.useState(false);
  
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };
  
    return (
        <>  
            <IconButton onClick={handleOpen}>
                {icon ? icon : <HelpOutlineIcon /> }
            </IconButton>                     
        
            <Dialog onClose={handleClose} open={open}>
                <DialogContent>
                    {children}
                </DialogContent>
            </Dialog>
        </>
    );
}
  