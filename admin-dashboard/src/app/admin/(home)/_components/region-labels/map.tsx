"use client";

import jsVectorMap from "jsvectormap";
import { useEffect } from "react";

import "@/js/us-aea-en";

export default function Map() {
  useEffect(() => {
    const mapElement = document.getElementById("mapOne");
    if (mapElement) {
      mapElement.innerHTML = "";
    }

    const map = new jsVectorMap({
      selector: "#mapOne",
      map: "us_aea_en",
      zoomButtons: true,
      regionStyle: {
        initial: {
          fill: "#C8D0D8",
        },
        hover: {
          fillOpacity: 1,
          fill: "#3056D3",
        },
      },
      regionLabelStyle: {
        initial: {
          fontWeight: "semibold",
          fill: "#fff",
        },
        hover: {
          cursor: "pointer",
        },
      },
      labels: {
        regions: {
          render(code: string) {
            return code.split("-")[1];
          },
        },
      },
    });

    return () => {
      if (map && typeof map.destroy === "function") {
        map.destroy();
      }
      if (mapElement) {
        mapElement.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="h-[422px]">
      <div id="mapOne" className="mapOne map-btn" />
    </div>
  );
}
