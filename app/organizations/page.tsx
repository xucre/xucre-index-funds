"use client";
import { useRouter } from "next/navigation";
import {  IconButton } from "@mui/material";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// OrganizationsTable.tsx
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { getAllOrganizations } from "@/service/clerk";

interface Organization {
  id: string;
  name: string;
  slug: string;
  maxAllowedMemberships: number;
  // Include other organization properties as needed
}

const OrganizationsTable: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getAllOrganizations();
        setOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Organization Name",
      flex: 1,
      headerClassName: "primaryBackground--header",
    },
    {
      field: "slug",
      headerName: "Slug",
      flex: 1,
      headerClassName: "primaryBackground--header",
    },
    {
      field: "maxAllowedMemberships",
      headerName: "Max Members",
      flex: 1,
      headerClassName: "primaryBackground--header",
    },
    {
      field: "view",
      headerName: "",
      sortable: false,
      headerClassName: "primaryBackground--header",
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          aria-label={params.row.name}
          onClick={() => router.push(`/organizations/id/${params.row.id}`)}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <OpaqueCard>
      {}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={organizations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25]}
          getRowId={(row) => row.id}
          sx={{
            "& .primaryBackground--header": {
              backgroundColor: "rgb(5,46,37)",
              "--DataGrid-containerBackground": "rgb(5,46,37)",
              "--DataGrid-pinnedBackground": "rgb(5,46,37)",
            },
          }}
        />
      </Box>
    </OpaqueCard>
  );
};

export default OrganizationsTable;

export const dynamic = "force-dynamic";
