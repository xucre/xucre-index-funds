"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, TextField, Typography } from "@mui/material";
import { createOrganization } from "@/service/clerk";

export default function CreateOrganizationPage() {
  // State variables to hold form input values
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);

  const router = useRouter(); // Initializing the router for navigation

  /**
   * Function to handle form submission
   * @param {FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Call the createOrganization function with the form input values
      await createOrganization({
        name,
        slug,
        maxAllowedMemberships: maxMembers,
      });

      // Navigate to the organizations page after successful creation
      router.push("/organizations");
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} p={3}>
      <Typography variant="h5">Create Organization</Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Organization Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Slug"
            variant="outlined"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <TextField
            label="Max Members"
            type="number"
            variant="outlined"
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
          />
          <Button variant="contained" type="submit">
            Create
          </Button>
        </Box>
      </form>
    </Box>
  );
}
