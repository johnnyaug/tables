type FactItem = {
  name: string;
  units?: string;
  quantity: string;
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
            <tr>
              <td>{f.name}{f.units ?` (${f.units})` : ""}</td>
              <td>{f.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
