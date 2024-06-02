export type FactItem = {
  name: string;
  units?: string;
  value: string;
};

type FactTableProps = {
  className: string;
  facts: FactItem[];
};
export default function FactTable({ className, facts }: FactTableProps) {
  return (
    <div className="performance-facts">
      <table>
        <thead>
          <tr>
            <th>סימון תזונתי</th>
            <th>ל-100 ג׳ מוצר</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((f) => (
            <tr key={f.name}>
              <td>{f.name}{f.units ?` (${f.units})` : ""}</td>
              <td>{f.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
