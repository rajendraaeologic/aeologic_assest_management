import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../Features/auth/authSlice";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { FaRegClock, FaUser } from "react-icons/fa";

const UserDashboard = () => {
  const user = useSelector(selectCurrentUser);

  const assignments = [
    {
      assignedAt: "2025-05-02T12:00:00Z",
      asset: {
        assetName: "Laptop Pro",
        uniqueId: "LAP-12345",
        model: "MacBook Pro 16-inch",
        serialNumber: "MBP-2025-001",
        assignedBy: "Jane Smith",
        assetCategory: "Laptop",
        warrantyExpiry: "2026-05-02T12:00:00Z",
        location: "Headquarters - Floor 2",
        condition: "Good",
        purchaseDate: "2025-04-01T12:00:00Z",
        value: "$2500",
        department: "IT Equipment",
      },
      user: {
        userName: "John Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        role: "Software Engineer",
        contactNumber: "+1234567890",
      },
    },
    {
      assignedAt: "2025-04-25T12:00:00Z",
      asset: {
        assetName: "Desktop Pro",
        uniqueId: "DESK-56789",
        model: "Dell Optiplex 7080",
        serialNumber: "DELL-2025-002",
        assignedBy: "Alex Johnson",
        assetCategory: "Desktop",
        warrantyExpiry: "2026-04-25T12:00:00Z",
        location: "Headquarters - Floor 3",
        condition: "Excellent",
        purchaseDate: "2025-03-01T12:00:00Z",
        value: "$1500",
        department: "IT Equipment",
      },
      user: {
        userName: "Alice Cooper",
        email: "alice.cooper@example.com",
        department: "Engineering",
        role: "Backend Developer",
        contactNumber: "+9876543210",
      },
    },
    {
      assignedAt: "2025-03-15T12:00:00Z",
      asset: {
        assetName: "Tablet Pro",
        uniqueId: "TAB-99876",
        model: "iPad Pro 12.9",
        serialNumber: "IPAD-2025-003",
        assignedBy: "Michael Lee",
        assetCategory: "Tablet",
        warrantyExpiry: "2026-03-15T12:00:00Z",
        location: "Remote",
        condition: "Good",
        purchaseDate: "2025-02-01T12:00:00Z",
        value: "$1000",
        department: "Sales",
      },
      user: {
        userName: "Sara Lee",
        email: "sara.lee@example.com",
        department: "Sales",
        role: "Sales Manager",
        contactNumber: "+1122334455",
      },
    },
  ];

  return (
    <div className="p-6 min-h-screen w-full bg-slate-300">
      <Box
        sx={{
          pt: 12,
          px: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {assignments.map((assignment, index) => (
          <Card
            key={index}
            sx={{
              width: "100%",
              maxWidth: 350,
              boxShadow: 8,
              borderRadius: 2,
              backgroundColor: "#F0F4F8",
              padding: "20px",
              marginBottom: "20px",
              "&:hover": {
                boxShadow: 12,
                transform: "scale(1.05)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1F2937" }}
              >
                Asset Assignment {index + 1}
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <FaRegClock style={{ marginRight: "8px", color: "#4B5563" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.9rem", color: "#374151" }}
                >
                  <strong>Assigned At:</strong>{" "}
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Asset Name:</strong> {assignment.asset.assetName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Asset ID:</strong> {assignment.asset.uniqueId}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Model:</strong> {assignment.asset.model}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Serial Number:</strong> {assignment.asset.serialNumber}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Assigned By:</strong> {assignment.asset.assignedBy}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Category:</strong> {assignment.asset.assetCategory}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Location:</strong> {assignment.asset.location}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Condition:</strong> {assignment.asset.condition}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Purchase Date:</strong>{" "}
                {new Date(assignment.asset.purchaseDate).toLocaleDateString()}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Warranty Expiry:</strong>{" "}
                {new Date(assignment.asset.warrantyExpiry).toLocaleDateString()}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#4B5563" }}
              >
                <strong>Asset Value:</strong> {assignment.asset.value}
              </Typography>

              <Box display="flex" alignItems="center" mt={2}>
                <FaUser style={{ marginRight: "8px", color: "#4B5563" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.9rem", color: "#374151" }}
                >
                  <strong>User Name:</strong> {assignment.user.userName}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#374151" }}
              >
                <strong>Email:</strong> {assignment.user.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#374151" }}
              >
                <strong>Department:</strong> {assignment.user.department}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#374151" }}
              >
                <strong>Role:</strong> {assignment.user.role}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#374151" }}
              >
                <strong>Contact Number:</strong> {assignment.user.contactNumber}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default UserDashboard;
