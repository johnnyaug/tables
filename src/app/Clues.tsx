export type Clue = {
  order: number;
  type: "photo_blurry" | "fact" | "ingredients";
  key: string;
  value: string;
};

export default function Clues({ clues }: { clues: Clue[] }) {
  return (
    <>
      {clues.map((c) => {
        if (!c) {
          return;
        }
        return (
          <div className="clue" key={c.order}>
            {(() => {
              switch (c.type) {
                case "photo_blurry":
                  return <img src={c.value} className="blur"></img>;
                case "ingredients":
                  const ingredients = JSON.parse(c.value);
                  const names: string[] = ingredients[0];
                  const percents: number[] = ingredients[1];
                  return (
                    <div>
                      <b>רכיבים</b>:&nbsp;
                      {names.map((n, i) => {
                        return `${n || "???"} (${percents[i]}%)`;
                      }).join(", ")}
                    </div>
                  );
                case "fact":
                  return (
                    <div>
                      {c.key}: {c.value}
                    </div>
                  );
              }
            })()}
          </div>
        );
      })}
    </>
  );
}
