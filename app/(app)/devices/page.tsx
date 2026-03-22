import DeviceCard from "@/components/devices/DeviceCard";

const defaultDevices = [
  { id: "lighting", name: "Smart Lighting", note: "Living room lights", isOn: true },
  { id: "fan", name: "Cooling Fan", note: "Bedroom fan", isOn: false },
  { id: "lock", name: "Main Door Lock", note: "Main entrance", isOn: true },
];

export default function DevicePage() {
  return (
    <section>
      <h2 className="page-title"> Your devices </h2>
      <p className="page-subtitle">Control and monitor your smart home devices.</p>

      <div className="grid three">
        {defaultDevices.map((device) => (
          <DeviceCard key={device.id} name={device.name} note={device.note} defaultOn={device.isOn} />
        ))}
      </div>
    </section>
  );
}
