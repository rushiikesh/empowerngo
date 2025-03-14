import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import { registerUser } from "../../api/masterApi";
import Swal from "sweetalert2";

const EditUserForm = ({ open, onClose, user }) => {
  const [status, setStatus] = useState(user.STATUS || "ACTIVE");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await registerUser({
        reqType: "u",
        userID: user.USER_ID,
        status,
      });
      if (response?.status === "SUCCESS") {
        Swal.fire({
          icon: "success",
          title: "Staff Updated",
          text: "Staff details updated successfully!",
        }).then(() => {
          onClose(); 
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.message || "Something went wrong!",
        }).then(() => {
          onClose(); // Close the dialog after error message
        });
      }
    } catch (error) {
      console.error("Error updating staff details:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An unexpected error occurred.",
      }).then(() => {
        onClose(); // Close the dialog after error message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth sx={{ 
        '& .MuiDialog-paper': { // Target the dialog's paper (content area)
          width: 400, // Your desired width
          margin: '0 auto', // Center horizontally
          display: 'flex',
          justifyContent: 'center', // Center content horizontally
          //alignItems: 'center', // Center content vertically (if needed)
        },
      }}  >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", textAlign: "center", paddingBottom: "10px" }}>
        Edit User Status
      </DialogTitle>
      <DialogContent sx={{ padding: "16px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InputLabel htmlFor="status" sx={{ marginBottom: "8px", fontWeight: "bold",color: "black" }}>
              Status
            </InputLabel>
            <FormControl fullWidth margin="dense">
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
                margin="dense"
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "flex-end", padding: "8px" }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#f44336",  // Red color for Cancel
            color: "white",
            marginRight: "8px",
            textTransform: "none",
            fontSize: "1rem",
            padding: "8px 16px",
            "&:hover": {
              backgroundColor: "#d32f2f",  // Darker red on hover
            },
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          sx={{
            backgroundColor: "#4caf50",  // Green color for Update
            color: "white",
            textTransform: "none",
            fontSize: "1rem",
            padding: "8px 16px",
            "&:hover": {
              backgroundColor: "#388e3c",  // Darker green on hover
            },
          }}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserForm;
