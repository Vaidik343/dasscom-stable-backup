// renderer/components/GlobalLoaderOverlay.jsx
import { useDeviceContext } from "../context/DeviceContext";
import Loader from "./Loader";
export default function GlobalLoaderOverlay() {
  const { loading } = useDeviceContext();
  if (!loading) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(255,255,255,0.7)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <Loader />
    </div>
  );
}