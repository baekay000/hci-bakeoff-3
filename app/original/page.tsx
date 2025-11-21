"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";

function Home() {
  const MapWrapper = useMemo(
    () =>
      dynamic(() => import("@/components/prototypes/one/original"), {
        loading: () => (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <p className="text-2xl">
              <Image
                src="/processing.svg"
                width={128}
                height={128}
                alt="processing logo"
              />
            </p>
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  return <MapWrapper />;
}

export default Home;
