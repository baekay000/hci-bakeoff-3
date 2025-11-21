import { readdirSync } from "fs";

function Home() {
  const ignored = [
    'favicon.ico',
    'globals.css',
    'layout.tsx',
    'page.tsx'
  ];
  const protoRoutes = readdirSync("./app").filter(name => !ignored.includes(name));

  return <>
    <div className="h-full w-full">
      <div className="sticky top-0 right-0 z-10 bg-blue-600 p-3 shadow-2xl">
        <p className="text-2xl text-center text-white">Pick a prototype</p>
      </div>

      <div className="flex flex-col overflow-scroll text-center">
        {
          protoRoutes.map((name, idx) =>
            <a key={idx} href={name}>
              <p
                className="bg-white hover:bg-neutral-100 p-3 border-b-2 border-neutral-200"
              >
                {name}
              </p>
            </a>
          )
        }
      </div>
    </div>
  </>;
}

export default Home;
