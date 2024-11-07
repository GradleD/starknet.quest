import React from "react";
import { Skeleton, CircularProgress } from "@mui/material";
import { Lock } from "@mui/icons-material"; 

type LoadingType = "skeleton" | "spinner";

interface LoadingWrapperProps {
  isLoading: boolean;
  loadingType?: LoadingType;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

const Loading: React.FC<LoadingWrapperProps> = ({
  isLoading,
  loadingType = "skeleton",
  children,
  width = "100%",
  height = 100,
}) => {
  if (!isLoading) return <>{children}</>;
  switch (loadingType) {
    case "skeleton":
      return (
        <div style={{ position: 'relative', width, height }}>
          <Skeleton
            sx={{ bgcolor: "grey.600" }}
            variant="rectangular"
            width="100%"
            height="100%"
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Lock sx={{ marginRight: 1 }} /> {/* Privacy Icon */}
            <Skeleton variant="text" width={80} />
          </div>
        </div>
      );
    case "spinner":
      return (
        <div className="flex justify-center items-center w-full h-[350px]">
          <CircularProgress />
        </div>
      );
    default:
      return null;
  }
};

export default Loading;
