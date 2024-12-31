import React, { useEffect, useState } from 'react';
import { Button, Modal, Box, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface EditOrganizationProps {
    publicMetadata: string;
    save: (updatedMetadata: string) => void;
}

const EditOrganization: React.FC<EditOrganizationProps> = ({ publicMetadata, save }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [metadata, setMetadata] = useState(publicMetadata);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleSave = () => {
        save(metadata);
        handleCloseModal();
    };

    useEffect(() => {
        setMetadata(publicMetadata);
    }, [publicMetadata]);

    return (
        <>
            <IconButton onClick={handleOpenModal} aria-label="Edit Public Metadata">
                <EditIcon />
            </IconButton>
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute' as const,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        minWidth: 600
                    }}
                >
                    <TextField
                        label="Public Metadata"
                        multiline
                        minRows={5}
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
                            Save
                        </Button>
                        <Button variant="outlined" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default EditOrganization;