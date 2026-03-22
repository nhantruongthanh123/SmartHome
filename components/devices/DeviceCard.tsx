"use client";

import { useState } from "react";

type DeviceCardProps = {
  name: string;
  note: string;
  defaultOn: boolean;
};

export default function DeviceCard({ name, note, defaultOn }: DeviceCardProps) {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <article className="card">
      <div className="device-header">
        <h3>{name}</h3>
        <button
          className={`device-toggle ${isOn ? "on" : "off"}`}
          type="button"
          onClick={() => setIsOn((current) => !current)}
          aria-pressed={isOn}
        >
          {isOn ? "ON" : "OFF"}
        </button>
      </div>

      <p className="page-subtitle"> Your device </p>
      <span className={`badge ${isOn ? "success" : "danger"}`}>{isOn ? "Active" : "Off"}</span>
    </article>
  );
}
